
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { getCustomerLoyalty } from "@/services/loyalty/customerLoyaltyService";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";

// Re-export from specialized services
export { getAllCustomers, getCustomerById } from "./customerQueryService";
export { updateCustomer } from "./customerUpdateService";
export { checkDuplicateCustomers, searchCustomers, getCustomersWithVehicles } from "./customerSearchService";
export { createCustomer } from "./customerCreateService";
export { clearDraftCustomer, saveDraftCustomer, getDraftCustomer } from "./customerDraftService";
export { getCustomerNotes, addCustomerNote } from "./customerNotesService";
export { importCustomersFromCSV } from "./customerImportService";
export { deleteCustomer, removeCustomerFromHousehold } from "./customerDeleteService";

// Re-export types
export type { CustomerCreate } from "@/types/customer";
