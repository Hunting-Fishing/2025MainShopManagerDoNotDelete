
import { supabase } from "@/integrations/supabase/client";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { getCustomerLoyalty } from "@/services/loyalty/customerLoyaltyService";

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
  const customers = (data || []).map(customer => adaptCustomerForUI(customer as Customer));
  
  // Fetch loyalty data for each customer
  // This is done separately to keep the initial customer query simple
  try {
    for (const customer of customers) {
      try {
        const loyalty = await getCustomerLoyalty(customer.id);
        if (loyalty) {
          customer.loyalty = loyalty;
        }
      } catch (error) {
        console.error(`Error fetching loyalty for customer ${customer.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching customer loyalty data:", error);
  }

  return customers;
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

  if (!data) return null;
  
  const customer = adaptCustomerForUI(data as Customer);
  
  // Fetch loyalty data
  try {
    const loyalty = await getCustomerLoyalty(customer.id);
    if (loyalty) {
      customer.loyalty = loyalty;
    }
  } catch (error) {
    console.error(`Error fetching loyalty for customer ${customer.id}:`, error);
  }

  return customer;
};
