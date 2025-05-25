
// Re-export everything from each service file
export * from './customerQueryService';
export * from './customerUpdateService';
export * from './customerNotesService';
export * from './customerDeleteService';
export * from './customerCreateService';
export * from './customerSearchService';
export * from './customerDraftService';
export * from './interactions/interactionQueryService';
export * from './interactions/interactionMutationService';

// Export the renamed functions to match what existing code expects
export { getCustomerById } from './customerQueryService';
export { getAllCustomers } from './customerQueryService';
export { updateCustomer } from './customerUpdateService';
export { deleteCustomer } from './customerDeleteService';
export { createCustomer } from './customerCreateService';
export { searchCustomers } from './customerSearchService';
