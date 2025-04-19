
import { supabase } from "@/lib/supabase";
import { CustomerNote } from "@/types/customer";

/**
 * Get all notes for a specific customer
 */
export const getCustomerNotes = async (customerId: string): Promise<CustomerNote[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_notes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
      
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
      .from('customer_notes')
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

/**
 * Add a new note using a direct API call with object parameter
 * This is a convenience method for the AddNoteDialog component
 */
export const addCustomerNote2 = async (noteData: {
  customer_id: string;
  content: string;
  category: 'service' | 'sales' | 'follow-up' | 'general';
  created_by: string;
}): Promise<CustomerNote> => {
  try {
    const { data, error } = await supabase
      .from('customer_notes')
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

/**
 * Update an existing customer note
 */
export const updateCustomerNote = async (
  noteId: string,
  content: string,
  category: 'service' | 'sales' | 'follow-up' | 'general'
): Promise<CustomerNote> => {
  try {
    const { data, error } = await supabase
      .from('customer_notes')
      .update({ content, category, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer note:", error);
      throw error;
    }

    return data as CustomerNote;
  } catch (error) {
    console.error("Error in updateCustomerNote:", error);
    throw error;
  }
};

/**
 * Delete a customer note
 */
export const deleteCustomerNote = async (noteId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('customer_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error("Error deleting customer note:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteCustomerNote:", error);
    throw error;
  }
};
