
import { supabase } from "@/lib/supabase";
import { CustomerInteraction } from "@/types/interaction";

/**
 * Add a new interaction for a customer
 */
export const addCustomerInteraction = async (
  interaction: Partial<CustomerInteraction>
): Promise<CustomerInteraction> => {
  try {
    const { data, error } = await supabase
      .from("customer_interactions")
      .insert({
        ...interaction,
        date: interaction.date || new Date().toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error adding customer interaction:", error);
      throw error;
    }
    
    return data as CustomerInteraction;
  } catch (error) {
    console.error("Error in addCustomerInteraction:", error);
    throw error;
  }
};

/**
 * Update an existing customer interaction
 */
export const updateCustomerInteraction = async (
  id: string,
  interaction: Partial<CustomerInteraction>
): Promise<CustomerInteraction> => {
  try {
    const { data, error } = await supabase
      .from("customer_interactions")
      .update(interaction)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating customer interaction:", error);
      throw error;
    }
    
    return data as CustomerInteraction;
  } catch (error) {
    console.error("Error in updateCustomerInteraction:", error);
    throw error;
  }
};

/**
 * Delete a customer interaction
 */
export const deleteCustomerInteraction = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("customer_interactions")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Error deleting customer interaction:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteCustomerInteraction:", error);
    throw error;
  }
};

/**
 * Mark a follow-up as completed
 */
export const completeFollowUp = async (
  interactionId: string,
  notes?: string
): Promise<CustomerInteraction> => {
  try {
    const updateData: any = {
      follow_up_completed: true,
      follow_up_completed_date: new Date().toISOString(),
    };
    
    if (notes) {
      updateData.follow_up_notes = notes;
    }
    
    const { data, error } = await supabase
      .from("customer_interactions")
      .update(updateData)
      .eq("id", interactionId)
      .select()
      .single();
      
    if (error) {
      console.error("Error completing follow-up:", error);
      throw error;
    }
    
    return data as CustomerInteraction;
  } catch (error) {
    console.error("Error in completeFollowUp:", error);
    throw error;
  }
};
