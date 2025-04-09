
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
    const interactions = data?.map(interaction => ({
      ...interaction,
      type: interaction.type as InteractionType,
      status: interaction.status as InteractionStatus
    })) || [];
    
    return interactions;
  } catch (error) {
    console.error("Error in getCustomerInteractions:", error);
    return [];
  }
};

// Add a customer interaction
export const addCustomerInteraction = async (
  interaction: Omit<CustomerInteraction, 'id'>
): Promise<CustomerInteraction | null> => {
  try {
    const { data, error } = await supabase
      .from("customer_interactions")
      .insert({
        ...interaction,
        type: interaction.type as InteractionType,
        status: interaction.status as InteractionStatus
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding customer interaction:", error);
      throw error;
    }
    
    console.log("Added new interaction:", data);
    
    // Ensure proper type casting
    return {
      ...data,
      type: data.type as InteractionType,
      status: data.status as InteractionStatus
    };
  } catch (error) {
    console.error("Error in addCustomerInteraction:", error);
    return null;
  }
};

// Update a customer interaction
export const updateCustomerInteraction = async (
  id: string,
  updates: Partial<CustomerInteraction>
): Promise<CustomerInteraction | null> => {
  try {
    const { data, error } = await supabase
      .from("customer_interactions")
      .update({
        ...updates,
        type: updates.type as InteractionType,
        status: updates.status as InteractionStatus
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating customer interaction:", error);
      throw error;
    }
    
    return {
      ...data,
      type: data.type as InteractionType,
      status: data.status as InteractionStatus
    };
  } catch (error) {
    console.error("Error in updateCustomerInteraction:", error);
    return null;
  }
};

// Delete a customer interaction
export const deleteCustomerInteraction = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("customer_interactions")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting customer interaction:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteCustomerInteraction:", error);
    return false;
  }
};

// Complete a follow-up interaction
export const completeFollowUp = async (id: string): Promise<CustomerInteraction | null> => {
  try {
    const { data, error } = await supabase
      .from("customer_interactions")
      .update({
        follow_up_completed: true,
        status: "completed" as InteractionStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error completing follow-up:", error);
      throw error;
    }
    
    return {
      ...data,
      type: data.type as InteractionType,
      status: data.status as InteractionStatus
    };
  } catch (error) {
    console.error("Error in completeFollowUp:", error);
    return null;
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
    const interactions = data?.map(interaction => ({
      ...interaction,
      type: interaction.type as InteractionType,
      status: interaction.status as InteractionStatus
    })) || [];
    
    return interactions;
  } catch (error) {
    console.error("Error in getPendingFollowUps:", error);
    return [];
  }
};
