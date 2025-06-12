
// Main customer service exports - consolidated to avoid duplicates
export * from './customerQueryService';
export * from './customerUpdateService';
export * from './customerNotesService';
export * from './customerDeleteService';
export * from './customerCreateService';
export * from './customerSearchService';
export * from './customerDraftService';
export * from './interactions/interactionQueryService';
export * from './interactions/interactionMutationService';

// Export the main functions with clear names
export { 
  getAllCustomers as getCustomers,
  getCustomerById as getCustomer,
  getCustomerById 
} from './customerQueryService';
export { updateCustomer } from './customerUpdateService';
export { deleteCustomer } from './customerDeleteService';
export { createCustomer } from './customerCreateService';
export { searchCustomers, checkDuplicateCustomers } from './customerSearchService';
export { saveDraftCustomer, getDraftCustomer, clearDraftCustomer } from './customerDraftService';
