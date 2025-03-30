
// Define the customer interface
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
}

// Helper type for creating a new customer
export type CustomerCreate = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

// Helper function to format customer display name
export const getCustomerFullName = (customer: Customer): string => {
  return `${customer.first_name} ${customer.last_name}`;
};
