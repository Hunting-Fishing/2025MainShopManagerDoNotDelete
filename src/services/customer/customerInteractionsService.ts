
import { supabase } from '@/lib/supabase';
import { CustomerInteraction } from '@/types/interaction';

/**
 * Get all interactions for a specific customer
 */
export const getCustomerInteractions = async (customerId: string): Promise<CustomerInteraction[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_interactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching customer interactions:', error);
      throw error;
    }
    
    // Format the data for the frontend
    const interactions: CustomerInteraction[] = data || [];
    
    return interactions;
  } catch (error) {
    console.error('Error in getCustomerInteractions:', error);
    throw error;
  }
};

/**
 * Add a new interaction for a customer
 */
export const addCustomerInteraction = async (interaction: Partial<CustomerInteraction>): Promise<CustomerInteraction> => {
  try {
    const { data, error } = await supabase
      .from('customer_interactions')
      .insert(interaction)
      .select()
      .single();
      
    if (error) {
      console.error('Error adding customer interaction:', error);
      throw error;
    }
    
    return data as CustomerInteraction;
  } catch (error) {
    console.error('Error in addCustomerInteraction:', error);
    throw error;
  }
};

/**
 * Update an existing customer interaction
 */
export const updateCustomerInteraction = async (interactionId: string, updates: Partial<CustomerInteraction>): Promise<CustomerInteraction> => {
  try {
    const { data, error } = await supabase
      .from('customer_interactions')
      .update(updates)
      .eq('id', interactionId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating customer interaction:', error);
      throw error;
    }
    
    return data as CustomerInteraction;
  } catch (error) {
    console.error('Error in updateCustomerInteraction:', error);
    throw error;
  }
};
