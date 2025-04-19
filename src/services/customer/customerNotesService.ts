
import { supabase } from "@/lib/supabase";
import { CustomerNote } from "@/types/customer";

export type CustomerNoteData = {
  customer_id: string;
  content: string;
  category: 'service' | 'sales' | 'follow-up' | 'general';
  created_by: string;
};

// Add customer note
export const addCustomerNote = async (
  noteData: CustomerNoteData
): Promise<CustomerNote> => {
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
};

// Get customer notes
export const getCustomerNotes = async (customerId: string): Promise<CustomerNote[]> => {
  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer notes:", error);
    throw error;
  }

  return (data || []).map(note => ({
    ...note,
    category: note.category as 'service' | 'sales' | 'follow-up' | 'general'
  }));
};

// Update customer note
export const updateCustomerNote = async (
  noteId: string,
  updates: Partial<CustomerNote>
): Promise<CustomerNote> => {
  const { data, error } = await supabase
    .from("customer_notes")
    .update(updates)
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer note:", error);
    throw error;
  }

  return data as CustomerNote;
};

// Delete customer note
export const deleteCustomerNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase
    .from("customer_notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    console.error("Error deleting customer note:", error);
    throw error;
  }
};
