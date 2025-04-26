
// Re-export everything from each service file
export * from './customerQueryService';
export * from './customerUpdateService';
export * from './customerNotesService';
export * from './customerDeleteService';
export * from './interactions/interactionQueryService';
export * from './interactions/interactionMutationService';
// Include any other customer service files here

// Export the renamed functions to match what existing code expects
export { getCustomerById } from './customerQueryService';
export { getAllCustomers } from './customerQueryService';
export { searchCustomers } from './customerSearchService';
export { updateCustomer } from './customerUpdateService';
export { deleteCustomer } from './customerDeleteService';
