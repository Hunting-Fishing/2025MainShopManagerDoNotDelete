
import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerCreate, adaptCustomerForUI, createCustomerForUI } from "@/types/customer";

// Export CustomerCreate type
export type { CustomerCreate };

// Fetch all customers
export const getAllCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }

  // Adapt each customer for UI components
  return (data || []).map(customer => adaptCustomerForUI(customer));
};

// Fetch a customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }

  return data ? adaptCustomerForUI(data) : null;
};

// Create a new customer
export const createCustomer = async (customer: CustomerCreate): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();

  if (error) {
    console.error("Error creating customer:", error);
    throw error;
  }

  return adaptCustomerForUI(data);
};

// Update a customer
export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer:", error);
    throw error;
  }

  return adaptCustomerForUI(data);
};

// Delete a customer
export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

// Search customers
export const searchCustomers = async (query: string): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error searching customers:", error);
    throw error;
  }

  return (data || []).map(customer => adaptCustomerForUI(customer));
};

// Check for potential duplicate customers
export const checkDuplicateCustomers = async (
  firstName: string, 
  lastName: string, 
  email?: string, 
  phone?: string
): Promise<Customer[]> => {
  // First check by name (more liberal search)
  let query = supabase
    .from("customers")
    .select("*")
    .or(`first_name.ilike.${firstName},last_name.ilike.${lastName}`);

  // If we have email or phone, make the search more specific
  if (email && email.length > 0) {
    query = query.or(`email.eq.${email}`);
  }
  
  if (phone && phone.length > 0) {
    const formattedPhone = phone.replace(/\D/g, ''); // Strip non-digits
    if (formattedPhone.length >= 10) {
      query = query.or(`phone.like.%${formattedPhone.slice(-10)}%`); // Match last 10 digits
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error checking for duplicate customers:", error);
    throw error;
  }

  return (data || []).map(customer => adaptCustomerForUI(customer));
};
