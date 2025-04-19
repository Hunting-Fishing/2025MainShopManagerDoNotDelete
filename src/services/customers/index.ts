
import { supabase } from "@/integrations/supabase/client";
import { CustomerNote } from "@/types/customer";
import { checkDuplicateCustomers, searchCustomers, getCustomersWithVehicles } from "./customerSearchService";
import { createCustomer } from "./customerCreateService";
import { clearDraftCustomer, saveDraftCustomer, getDraftCustomer } from "./customerDraftService";
import { getCustomerNotes as fetchCustomerNotes, addCustomerNote as addNote } from "@/services/customer/customerNotesService";

// Re-export the getCustomerNotes function using the consolidated implementation
export const getCustomerNotes = fetchCustomerNotes;

// Legacy wrapper for addCustomerNote to maintain backwards compatibility
export const addCustomerNote = async (
  customerId: string,
  content: string,
  category: 'service' | 'sales' | 'follow-up' | 'general',
  createdBy: string
): Promise<CustomerNote> => {
  return await addNote({
    customer_id: customerId,
    content,
    category,
    created_by: createdBy
  });
};

// Re-export functions from customerSearchService
export { checkDuplicateCustomers, searchCustomers, getCustomersWithVehicles };

// Re-export functions from customerCreateService
export { createCustomer };

// Re-export functions from customerDraftService
export { clearDraftCustomer, saveDraftCustomer, getDraftCustomer };
