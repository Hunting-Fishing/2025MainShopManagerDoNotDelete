
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

interface AddNoteParams {
  customer_id: string;
  content: string;
  category: 'service' | 'sales' | 'follow-up' | 'general';
  created_by: string;
}

/**
 * Add a new note for a customer
 */
export const addCustomerNote = async (
  noteData: AddNoteParams
): Promise<CustomerNote> => {
  try {
    const { data, error } = await supabase
      .from("customer_notes")
      .insert(noteData)
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
