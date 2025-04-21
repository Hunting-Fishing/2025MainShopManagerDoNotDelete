
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.2.0";

// Define the headers for CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { workOrderId, newStatus, oldStatus, message } = await req.json();

    if (!workOrderId || !newStatus) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // If status hasn't changed, don't create a notification
    if (newStatus === oldStatus) {
      return new Response(
        JSON.stringify({ success: true, message: "Status unchanged" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Get the work order to find customer ID
    const { data: workOrder, error: workOrderError } = await supabaseAdmin
      .from("work_orders")
      .select("customer_id, description")
      .eq("id", workOrderId)
      .single();

    if (workOrderError || !workOrder) {
      return new Response(
        JSON.stringify({ error: "Work order not found", details: workOrderError }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Determine notification type and title based on new status
    let notificationType, title;
    switch (newStatus) {
      case "in-progress":
        notificationType = "status_update";
        title = "Work Order In Progress";
        break;
      case "completed":
        notificationType = "completion";
        title = "Work Order Completed";
        break;
      case "cancelled":
        notificationType = "cancellation";
        title = "Work Order Cancelled";
        break;
      default:
        notificationType = "status_update";
        title = `Work Order Status: ${newStatus}`;
    }

    // Create default message if none provided
    const notificationMessage = message || 
      `Your work order has been updated to status: ${newStatus}`;

    // Create notification for customer
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from("work_order_notifications")
      .insert({
        work_order_id: workOrderId,
        notification_type: notificationType,
        title: title,
        message: notificationMessage,
        recipient_type: "customer",
        recipient_id: workOrder.customer_id,
        status: "pending"
      })
      .select()
      .single();

    if (notificationError) {
      return new Response(
        JSON.stringify({ error: "Failed to create notification", details: notificationError }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Update work order status
    const { error: updateError } = await supabaseAdmin
      .from("work_orders")
      .update({ status: newStatus })
      .eq("id", workOrderId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update work order", details: updateError }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        notification,
        message: "Status updated and notification created"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
