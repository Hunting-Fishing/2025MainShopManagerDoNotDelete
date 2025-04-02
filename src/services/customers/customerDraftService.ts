
import { supabase } from "@/integrations/supabase/client";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";

// Key for storing draft customer data in localStorage
const DRAFT_CUSTOMER_KEY = 'draftCustomer';

// Save customer form draft to localStorage
export const saveDraftCustomer = async (customerData: CustomerFormValues): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRAFT_CUSTOMER_KEY, JSON.stringify(customerData));
    }
    
    // Could also save to Supabase if needed
    // const { data: { user } } = await supabase.auth.getUser();
    // if (user) {
    //   const { error } = await supabase
    //     .from('customer_drafts')
    //     .upsert({
    //       user_id: user.id,
    //       draft_data: customerData
    //     });
    //   if (error) throw error;
    // }
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error saving draft customer:", error);
    return Promise.reject(error);
  }
};

// Retrieve customer form draft from localStorage
export const getDraftCustomer = async (): Promise<CustomerFormValues | null> => {
  try {
    if (typeof window !== 'undefined') {
      const draftData = localStorage.getItem(DRAFT_CUSTOMER_KEY);
      if (!draftData) return null;
      
      return JSON.parse(draftData) as CustomerFormValues;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving draft customer:", error);
    return null;
  }
};

// Clear the draft customer data from local storage or other temporary storage
export const clearDraftCustomer = async (): Promise<void> => {
  // Remove draft data from localStorage if it exists
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DRAFT_CUSTOMER_KEY);
  }
  
  // If using Supabase to store drafts, you could clear it that way too
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // You could also delete any draft records from a drafts table if you have one
      // const { error } = await supabase
      //   .from('customer_drafts')
      //   .delete()
      //   .eq('user_id', user.id);
      
      // if (error) throw error;
    }
  } catch (error) {
    console.error("Error clearing draft customer:", error);
    // Non-blocking error, so we don't throw
  }
};
