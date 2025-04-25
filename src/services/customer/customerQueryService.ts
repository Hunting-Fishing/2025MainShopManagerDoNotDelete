
import { supabase } from "@/lib/supabase";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { getCustomerLoyalty } from "@/services/loyalty/customerLoyaltyService";

// Fetch all customers
export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("Fetching all customers...");
    const { data: customersData, error: customersError } = await supabase
      .from("customers")
      .select("*")
      .order("last_name", { ascending: true });
    
    if (customersError) {
      console.error("Error fetching customers:", customersError);
      throw customersError;
    }
    
    if (!customersData) {
      console.log("No customer data returned");
      return [];
    }
    
    console.log(`Successfully fetched ${customersData.length} customers from database`);
    
    // Adapt the customer data for UI
    const customers = customersData.map(customer => adaptCustomerForUI(customer as any));
    console.log("Successfully adapted customer data for UI");
    
    // Fetch additional data for each customer
    for (const customer of customers) {
      try {
        // Fetch loyalty data
        const loyalty = await getCustomerLoyalty(customer.id);
        if (loyalty) {
          customer.loyalty = loyalty;
        }
        
        // Fetch vehicles
        const { data: vehiclesData } = await supabase
          .from("vehicles")
          .select("*")
          .eq("customer_id", customer.id);
          
        customer.vehicles = vehiclesData || [];
      } catch (error) {
        console.error(`Error fetching additional data for customer ${customer.id}:`, error);
      }
    }

    return customers;
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    throw error;
  }
};

// Fetch a customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    console.log("Fetching customer by ID:", id);
    
    if (!id || id === "undefined") {
      console.error("Invalid customer ID provided:", id);
      return null;
    }
    
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }

    if (!data) {
      console.log("No customer found with ID:", id);
      return null;
    }
    
    console.log("Customer data from DB:", data);
    const customer = adaptCustomerForUI(data as any);
    
    // Fetch vehicles for this customer
    try {
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", customer.id);
        
      if (vehiclesError) {
        console.error(`Error fetching vehicles for customer ${customer.id}:`, vehiclesError);
      } else {
        customer.vehicles = vehiclesData || [];
      }
    } catch (error) {
      console.error(`Error processing vehicles for customer ${customer.id}:`, error);
      customer.vehicles = [];
    }
    
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
    throw error;
  }
};

// Backward compatible function to maintain existing code compatibility
export const getCustomer = getCustomerById;
