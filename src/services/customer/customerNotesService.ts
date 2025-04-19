
import { supabase } from "@/lib/supabase";
import { CustomerNote } from "@/types/customer";

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
export const addCustomerNote = async (
  customerId: string,
  content: string,
  category: 'service' | 'sales' | 'follow-up' | 'general',
  createdBy: string
): Promise<CustomerNote> => {
  try {
    const newNote = {
      customer_id: customerId,
      content,
      category,
      created_by: createdBy,
    };

    const { data, error } = await supabase
      .from("customer_notes")
      .insert(newNote)
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
