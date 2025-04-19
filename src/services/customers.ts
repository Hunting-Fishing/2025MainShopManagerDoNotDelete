
import { supabase } from "@/lib/supabase";
import { Customer, CustomerNote } from "@/types/customer";

/**
 * Get all customer notes for a specific customer
 */
export const getCustomerNotes = async (customerId: string): Promise<CustomerNote[]> => {
  try {
    const { data, error } = await supabase
      .from("customer_notes")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching customer notes:", error);
      throw error;
    }
    
    return data as CustomerNote[];
  } catch (error) {
    console.error("Error in getCustomerNotes:", error);
    throw error;
  }
};

/**
 * Add a new note for a customer
 */
export const addCustomerNote = async (note: Partial<CustomerNote>): Promise<CustomerNote> => {
  try {
    const { data, error } = await supabase
      .from("customer_notes")
      .insert(note)
      .select()
      .single();
      
    if (error) {
      console.error("Error adding customer note:", error);
      throw error;
    }
    
    return data as CustomerNote;
  } catch (error) {
    console.error("Error in addCustomerNote:", error);
    throw error;
  }
};

// More customer-related functions can be added here
