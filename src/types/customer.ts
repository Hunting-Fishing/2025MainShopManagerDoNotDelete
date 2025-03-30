
// Define the customer interface based on Supabase table structure
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  shop_id: string;
  created_at: string;
  updated_at: string;
  
  // We'll add these fields for compatibility with existing components
  // They will be undefined on direct database objects, but we'll use getters
  company?: string;
  notes?: string;
  status?: string;
  lastServiceDate?: string;
}

// Helper type for creating a new customer
export type CustomerCreate = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

// Helper function to format customer display name
export const getCustomerFullName = (customer: Customer): string => {
  return `${customer.first_name} ${customer.last_name}`;
};

// Helper function to adapt database customer objects to the format expected by UI components
export const adaptCustomerForUI = (customer: Customer): Customer => {
  return {
    ...customer,
    // Add UI-expected fields (these will be used by the components)
    status: 'active', // Default status since we don't have this in the database yet
    lastServiceDate: undefined, // This would need to come from work orders in a real implementation
  };
};

// Helper function to create a UI-compatible customer object
export const createCustomerForUI = (
  dbCustomer: Customer,
  additionalProps?: {
    company?: string;
    notes?: string;
    lastServiceDate?: string;
    status?: string;
  }
): Customer & {name: string} => {
  return {
    ...dbCustomer,
    ...additionalProps,
    name: getCustomerFullName(dbCustomer),
  } as Customer & {name: string};
};
