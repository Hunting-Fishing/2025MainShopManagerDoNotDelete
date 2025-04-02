
import { supabase } from "@/integrations/supabase/client";

// Clear the draft customer data from local storage or other temporary storage
export const clearDraftCustomer = async (): Promise<void> => {
  // Remove draft data from localStorage if it exists
  if (typeof window !== 'undefined') {
    localStorage.removeItem('draftCustomer');
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
