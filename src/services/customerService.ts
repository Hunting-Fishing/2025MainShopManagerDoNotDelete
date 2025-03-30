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
