
import { supabase } from "@/integrations/supabase/client";

// Add customer note
export const addCustomerNote = async (
  customerId: string, 
  content: string, 
  category: string = 'general',
  createdBy: string = 'Current User'
): Promise<any> => {
  const { data, error } = await supabase
    .from("customer_notes")
    .insert({
      customer_id: customerId,
      content,
      category,
      created_by: createdBy
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding customer note:", error);
    throw error;
  }

  return data;
};

// Get customer notes
export const getCustomerNotes = async (customerId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer notes:", error);
    throw error;
  }

  return data || [];
};
