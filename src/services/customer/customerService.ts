
import { supabase } from "@/lib/supabase";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { getCustomerLoyalty } from "@/services/loyalty/customerLoyaltyService";
import { CustomerFormValues } from "@/components/customers/form/schemas/customerSchema";

// Re-export from specialized services
export { getAllCustomers, getCustomerById } from "./customerQueryService";
export { updateCustomer } from "./customerUpdateService";
export { checkDuplicateCustomers, searchCustomers } from "./customerSearchService";
export { createCustomer } from "./customerCreateService";
export { clearDraftCustomer, saveDraftCustomer, getDraftCustomer } from "./customerDraftService";
export { getCustomerNotes, addCustomerNote } from "./customerNotesService";
export { importCustomersFromCSV } from "./customerImportService";
export { deleteCustomer, removeCustomerFromHousehold } from "./customerDeleteService";

// Re-export types
export type { CustomerCreate } from "@/types/customer";

/**
 * Get customers with their associated vehicles
 * @deprecated Use specialized customer query services instead
 */
export const getCustomersWithVehicles = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        vehicles:customer_vehicles(*)
      `)
      .order('last_name', { ascending: true });
      
    if (error) {
      console.error("Error fetching customers with vehicles:", error);
      throw error;
    }
    
    return (data || []).map((customer: any) => ({
      ...adaptCustomerForUI(customer),
      vehicles: customer.vehicles || []
    }));
  } catch (error) {
    console.error("Error in getCustomersWithVehicles:", error);
    throw error;
  }
};
