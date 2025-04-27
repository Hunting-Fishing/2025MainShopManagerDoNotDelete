
import { supabase } from "@/integrations/supabase/client";
import { CustomerNote } from "@/types/customer";
import { checkDuplicateCustomers, searchCustomers, getCustomersWithVehicles } from "./customerSearchService";
import { createCustomer } from "./customerCreateService";
import { clearDraftCustomer, saveDraftCustomer, getDraftCustomer } from "./customerDraftService";

export const getCustomerNotes = async (customerId: string): Promise<CustomerNote[]> => {
  const { data, error } = await supabase
    .from('customer_notes')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching customer notes:", error);
    throw error;
  }

  return data.map(note => ({
    ...note,
    category: note.category as "service" | "sales" | "follow-up" | "general"
  })) || [];
};

export const addCustomerNote = async (
  customerId: string,
  content: string,
  category: 'service' | 'sales' | 'follow-up' | 'general',
  createdBy: string
): Promise<CustomerNote> => {
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
};

// Re-export functions from customerSearchService
export { checkDuplicateCustomers, searchCustomers, getCustomersWithVehicles };

// Re-export functions from customerCreateService
export { createCustomer };

// Re-export functions from customerDraftService
export { clearDraftCustomer, saveDraftCustomer, getDraftCustomer };
