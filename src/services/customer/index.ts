
// Re-export everything from each service file
export * from './customerQueryService';
export * from './customerUpdateService';
export * from './customerNotesService';
// Include any other customer service files here

// Export the renamed functions to match what existing code expects
export { getCustomerById } from './customerQueryService';
export { getAllCustomers } from './customerQueryService';
export { searchCustomers } from '../customer';  // referring to the parent directory
export { updateCustomer } from './customerUpdateService';
