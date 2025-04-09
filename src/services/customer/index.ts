
// Re-export everything from each service file
export * from './customerQueryService';
export * from './customerUpdateService';
export * from './customerNotesService';
// Include any other customer service files here

// Export the renamed functions to match what existing code expects
export { getCustomer as getCustomerById } from './customerQueryService';
export { getAllCustomers } from './customer/customerQueryService';
export { searchCustomers } from './customer';
export { updateCustomer } from './customer/customerUpdateService';
