
import { supabase } from "@/lib/supabase";
import { CustomerInteraction } from "@/types/interaction";

/**
 * Get all interactions for a specific customer
 */
export const getCustomerInteractions = async (customerId: string): Promise<CustomerInteraction[]> => {
  try {
    const { data, error } = await supabase
      .from("customer_interactions")
      .select("*")
      .eq("customer_id", customerId)
      .order("date", { ascending: false });
      
    if (error) {
      console.error("Error fetching customer interactions:", error);
      throw error;
    }
    
    return data as CustomerInteraction[];
  } catch (error) {
    console.error("Error in getCustomerInteractions:", error);
    throw error;
  }
};

/**
 * Get customer interactions that need follow-ups
 */
export const getPendingFollowUps = async (staffId?: string): Promise<CustomerInteraction[]> => {
  try {
    let query = supabase
      .from("customer_interactions")
      .select(`
        *,
        customers!customer_interactions_customer_id_fkey(first_name, last_name)
      `)
      .eq("requires_follow_up", true)
      .eq("follow_up_completed", false)
      .order("follow_up_date", { ascending: true });
      
    if (staffId) {
      query = query.eq("staff_member_id", staffId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching pending follow-ups:", error);
      throw error;
    }
    
    return data.map(item => ({
      ...item,
      customer_name: item.customers ? 
        `${item.customers.first_name} ${item.customers.last_name}` : 
        "Unknown Customer"
    })) as CustomerInteraction[];
  } catch (error) {
    console.error("Error in getPendingFollowUps:", error);
    throw error;
  }
};

/**
 * Get all interactions for a specific vehicle
 */
export const getVehicleInteractions = async (vehicleId: string): Promise<CustomerInteraction[]> => {
  try {
    const { data, error } = await supabase
      .from("customer_interactions")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("date", { ascending: false });
      
    if (error) {
      console.error("Error fetching vehicle interactions:", error);
      throw error;
    }
    
    return data as CustomerInteraction[];
  } catch (error) {
    console.error("Error in getVehicleInteractions:", error);
    throw error;
  }
};
