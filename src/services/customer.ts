
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

/**
 * Search for customers by name or email
 */
export const searchCustomers = async (query: string): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  if (error) {
    console.error("Error searching customers:", error);
    throw error;
  }

  return data || [];
};

/**
 * Get customer by ID
 */
export const getCustomer = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error getting customer:", error);
    throw error;
  }

  return data;
};

// Re-export from more specialized services for backward compatibility
export { getCustomerById } from './customer/customerQueryService';
export { getAllCustomers } from './customer/customerQueryService';
export { updateCustomer } from './customer/customerUpdateService';
export { createCustomer } from './customer/customerCreateService';
