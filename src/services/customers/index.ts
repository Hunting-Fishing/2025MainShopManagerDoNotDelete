
// Re-export all customer services from the consolidated customer directory
export * from '../customer';

// Specific exports for backward compatibility
export {
  getAllCustomers,
  getCustomerById,
  searchCustomers,
  checkDuplicateCustomers,
  getCustomersWithVehicles
} from '../customer/customerQueryService';

export {
  updateCustomer
} from '../customer/customerUpdateService';

export {
  deleteCustomer
} from '../customer/customerDeleteService';

export {
  createCustomer
} from '../customer/customerCreateService';

export {
  addCustomerNote,
  getCustomerNotes,
  updateCustomerNote,
  deleteCustomerNote
} from '../customer/customerNotesService';

export {
  saveDraftCustomer,
  getDraftCustomer,
  clearDraftCustomer
} from '../customer/customerDraftService';

export {
  getCustomerInteractions,
  addCustomerInteraction,
  updateCustomerInteraction,
  deleteCustomerInteraction
} from '../customer/interactions';

// Export types
export type { Customer, CustomerCreate, CustomerNote } from '../customer';
