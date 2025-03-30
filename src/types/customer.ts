
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
  
  // Added fields for enhanced customer management
  preferred_technician_id?: string;
  referral_source?: string;
  referral_person_id?: string;
  household_id?: string;
  is_fleet?: boolean;
  fleet_company?: string;
  notes?: string;
  
  // We'll add these fields for compatibility with existing components
  // They will be undefined on direct database objects, but we'll use getters
  company?: string;
  status?: string;
  lastServiceDate?: string;
  name?: string;
  dateAdded?: string;
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
    name: getCustomerFullName(customer),
    dateAdded: customer.created_at,
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
): Customer => {
  return {
    ...dbCustomer,
    ...additionalProps,
    name: getCustomerFullName(dbCustomer),
    dateAdded: dbCustomer.created_at,
  };
};
