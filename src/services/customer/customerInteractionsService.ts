
import { supabase } from "@/lib/supabase";
import { CustomerInteraction } from "@/types/interaction";

// Get customer interactions
export const getCustomerInteractions = async (customerId: string): Promise<CustomerInteraction[]> => {
  try {
    // Get interactions from the data/interactions module instead of Supabase
    // This will be replaced with real data when the table exists
    const interactions = await import("@/data/interactionsData").then(
      module => module.getCustomerInteractions(customerId)
    );
    
    console.log("Retrieved customer interactions:", interactions);
    
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
    // Add interaction using the data/interactions module
    const newInteraction = await import("@/data/interactionsData").then(
      module => module.addInteraction(interaction)
    );
    
    console.log("Added new interaction:", newInteraction);
    
    return newInteraction;
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
    // For now, we don't have a direct way to update interactions in the mock data
    // This will be replaced with real database calls once the table exists
    console.warn("updateCustomerInteraction not fully implemented with real data yet");
    return {
      id,
      ...updates
    } as CustomerInteraction;
  } catch (error) {
    console.error("Error in updateCustomerInteraction:", error);
    return null;
  }
};

// Delete a customer interaction
export const deleteCustomerInteraction = async (id: string): Promise<boolean> => {
  try {
    // For now, we don't have a direct way to delete interactions in the mock data
    // This will be replaced with real database calls once the table exists
    console.warn("deleteCustomerInteraction not fully implemented with real data yet");
    return true;
  } catch (error) {
    console.error("Error in deleteCustomerInteraction:", error);
    return false;
  }
};
