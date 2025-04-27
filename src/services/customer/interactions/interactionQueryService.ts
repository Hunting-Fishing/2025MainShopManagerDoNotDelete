
import { supabase } from "@/lib/supabase";
import { CustomerInteraction, InteractionType, InteractionStatus } from "@/types/interaction";

// Get customer interactions
export const getCustomerInteractions = async (customerId: string): Promise<CustomerInteraction[]> => {
  try {
    console.log("Fetching interactions for customer:", customerId);
    
    const { data, error } = await supabase
      .from("customer_interactions")
      .select("*")
      .eq("customer_id", customerId)
      .order("date", { ascending: false });
    
    if (error) {
      console.error("Error fetching customer interactions:", error);
      throw error;
    }
    
    console.log("Retrieved customer interactions:", data);
    
    // Ensure proper type casting
    const interactions = (data || []).map(interaction => ({
      ...interaction,
      type: interaction.type as InteractionType,
      status: interaction.status as InteractionStatus
    })) as CustomerInteraction[];
    
    return interactions;
  } catch (error) {
    console.error("Error in getCustomerInteractions:", error);
    return [];
  }
};

// Get vehicle interactions - Filters by work orders related to the vehicle
export const getVehicleInteractions = async (vehicleId: string): Promise<CustomerInteraction[]> => {
  try {
    console.log("Fetching interactions for vehicle:", vehicleId);
    
    // Since vehicle_id doesn't exist in the table, we need to modify our approach
    // We'll get all work orders related to this vehicle
    const { data: workOrders, error: workOrderError } = await supabase
      .from('work_orders')
      .select('id')
      .eq('vehicle_id', vehicleId);
      
    if (workOrderError) {
      console.error("Error fetching work orders for vehicle:", workOrderError);
      throw workOrderError;
    }
    
    // Extract work order IDs
    const workOrderIds = workOrders?.map(wo => wo.id) || [];
    console.log(`Found ${workOrderIds.length} work orders for vehicle`);
    
    // If no work orders, return empty array
    if (workOrderIds.length === 0) {
      return [];
    }
    
    // Get interactions related to these work orders
    const { data, error } = await supabase
      .from("customer_interactions")
      .select("*")
      .in("related_work_order_id", workOrderIds)
      .order("date", { ascending: false });
    
    if (error) {
      console.error("Error fetching vehicle interactions:", error);
      throw error;
    }
    
    console.log("Retrieved vehicle interactions:", data);
    
    // Map with explicit type casting for enum fields
    const interactions: CustomerInteraction[] = (data || []).map(item => ({
      id: item.id,
      customer_id: item.customer_id,
      customer_name: item.customer_name,
      date: item.date,
      type: item.type as InteractionType,
      description: item.description,
      staff_member_id: item.staff_member_id,
      staff_member_name: item.staff_member_name,
      status: item.status as InteractionStatus,
      notes: item.notes,
      related_work_order_id: item.related_work_order_id,
      follow_up_date: item.follow_up_date,
      follow_up_completed: item.follow_up_completed,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Add the vehicle_id property for UI consistency
      vehicle_id: vehicleId
    }));
    
    return interactions;
  } catch (error) {
    console.error("Error in getVehicleInteractions:", error);
    return [];
  }
};

// Get all pending follow-ups
export const getPendingFollowUps = async (): Promise<CustomerInteraction[]> => {
  try {
    const { data, error } = await supabase
      .from("customer_interactions")
      .select("*")
      .eq("type", "follow_up")
      .eq("follow_up_completed", false)
      .not("follow_up_date", "is", null)
      .order("follow_up_date", { ascending: true });
    
    if (error) {
      console.error("Error fetching pending follow-ups:", error);
      throw error;
    }
    
    // Ensure proper type casting
    const interactions = (data || []).map(interaction => ({
      ...interaction,
      type: interaction.type as InteractionType,
      status: interaction.status as InteractionStatus
    })) as CustomerInteraction[];
    
    return interactions;
  } catch (error) {
    console.error("Error in getPendingFollowUps:", error);
    return [];
  }
};
