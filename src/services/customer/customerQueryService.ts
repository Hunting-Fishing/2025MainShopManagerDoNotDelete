
import { supabase } from "@/lib/supabase";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { getCustomerLoyalty } from "@/services/loyalty/customerLoyaltyService";

// Fetch all customers
export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("Fetching all customers...");
    const { data, error } = await supabase
      .from("customers")
      .select(`
        *,
        vehicles(*)
      `)
      .order("last_name", { ascending: true });
    
    if (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
    
    console.log("Customer data fetched:", data);
    
    // Handle null or undefined data
    if (!data) {
      console.log("No customer data returned");
      return [];
    }
    
    // Fix the type assertion by first converting to unknown
    const customers = data.map(customer => adaptCustomerForUI(customer as Customer));
    
    console.log("Adapted customers:", customers);
    
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
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    return [];
  }
};

// Fetch a customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    console.log("Fetching customer by ID:", id);
    
    const { data, error } = await supabase
      .from("customers")
      .select(`
        *,
        vehicles(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }

    if (!data) {
      console.log("No customer found with ID:", id);
      return null;
    }
    
    console.log("Customer data from DB:", data);
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
  } catch (error) {
    console.error("Error in getCustomerById:", error);
    return null;
  }
};

// Backward compatible function to maintain existing code compatibility
export const getCustomer = getCustomerById;
