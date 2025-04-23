
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";
import { Vehicle } from "@/types/customer/vehicle";
import { WorkOrder } from "@/types/workOrder";

interface CustomerChatData {
  customer: Customer | null;
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
}

export const getCustomerDataForChat = async (customerId: string): Promise<CustomerChatData> => {
  if (!customerId) {
    return { customer: null, vehicles: [], workOrders: [] };
  }

  try {
    // Fetch customer data
    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    
    if (customerError) {
      console.error("Error fetching customer data:", customerError);
      return { customer: null, vehicles: [], workOrders: [] };
    }
    
    // Fetch vehicles
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("customer_id", customerId)
      .order("updated_at", { ascending: false });
    
    if (vehiclesError) {
      console.error("Error fetching vehicles:", vehiclesError);
    }
    
    // Fetch work orders
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from("work_orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("updated_at", { ascending: false })
      .limit(5);
    
    if (workOrdersError) {
      console.error("Error fetching work orders:", workOrdersError);
    }
    
    return {
      customer: customerData,
      vehicles: vehiclesData || [],
      workOrders: workOrdersData || []
    };
  } catch (error) {
    console.error("Failed to fetch customer chat data:", error);
    return { customer: null, vehicles: [], workOrders: [] };
  }
};

export const createCustomerChatRoom = async (
  customerId: string, 
  staffId: string,
  staffName: string
) => {
  try {
    // Check if a direct chat already exists between customer and staff
    const { data: existingRooms, error: roomCheckError } = await supabase
      .from("chat_rooms")
      .select("*, chat_participants(*)")
      .eq("type", "direct")
      .contains("metadata", { customer_id: customerId })
      .contains("metadata", { is_customer_chat: true });
    
    if (roomCheckError) {
      console.error("Error checking existing chat rooms:", roomCheckError);
      throw roomCheckError;
    }
    
    // If room exists, return it
    if (existingRooms && existingRooms.length > 0) {
      return existingRooms[0];
    }
    
    // Get customer details for the room name
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("first_name, last_name")
      .eq("id", customerId)
      .single();
    
    if (customerError) {
      console.error("Error fetching customer details:", customerError);
      throw customerError;
    }
    
    // Create a new room
    const { data: newRoom, error: roomError } = await supabase
      .from("chat_rooms")
      .insert({
        name: `Chat with ${customer.first_name} ${customer.last_name}`,
        type: "direct",
        metadata: {
          customer_id: customerId,
          is_customer_chat: true,
          created_by: staffId
        }
      })
      .select()
      .single();
    
    if (roomError) {
      console.error("Error creating chat room:", roomError);
      throw roomError;
    }
    
    // Add staff participant
    const { error: participantError1 } = await supabase
      .from("chat_participants")
      .insert({
        room_id: newRoom.id,
        user_id: staffId
      });
      
    if (participantError1) {
      console.error("Error adding staff participant:", participantError1);
    }
    
    // Add customer as a virtual participant with a special identifier
    const customerUserId = `customer-${customerId}`;
    const { error: participantError2 } = await supabase
      .from("chat_participants")
      .insert({
        room_id: newRoom.id,
        user_id: customerUserId
      });
    
    if (participantError2) {
      console.error("Error adding customer participant:", participantError2);
    }
    
    // Add a system message
    await supabase
      .from("chat_messages")
      .insert({
        room_id: newRoom.id,
        sender_id: "system",
        sender_name: "System",
        content: `Chat started with customer: ${customer.first_name} ${customer.last_name}`,
        message_type: "system"
      });
    
    return newRoom;
  } catch (error) {
    console.error("Failed to create customer chat room:", error);
    throw error;
  }
};
