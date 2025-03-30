
// This file will set up stored procedures in Supabase to handle work order operations

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create stored procedures for work order operations
    const { error: proceduresError } = await supabase.rpc('create_work_order_procedures');
    
    if (proceduresError) {
      throw new Error(`Error creating procedures: ${proceduresError.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Stored procedures created successfully" 
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error setting up work orders:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
});
