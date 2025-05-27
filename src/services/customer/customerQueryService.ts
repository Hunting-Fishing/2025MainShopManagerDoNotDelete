
import { supabase } from "@/integrations/supabase/client";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { getCustomerLoyalty } from "@/services/loyalty/customerLoyaltyService";

export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("last_name", { ascending: true });
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    const customers = data.map(customer => adaptCustomerForUI(customer as Customer));
    
    // Fetch vehicles for each customer separately
    for (const customer of customers) {
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
        customer.vehicles = [];
      }
    }
    
    // Fetch loyalty data for each customer
    try {
      for (const customer of customers) {
        try {
          const loyalty = await getCustomerLoyalty(customer.id);
          if (loyalty) {
            customer.loyalty = loyalty;
          }
        } catch (error) {
          // Continue without loyalty data
        }
      }
    } catch (error) {
      // Continue without loyalty data
    }

    return customers;
  } catch (error) {
    return [];
  }
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }
    
    const customer = adaptCustomerForUI(data as Customer);
    
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
      customer.vehicles = [];
    }
    
    // Fetch loyalty data
    try {
      const loyalty = await getCustomerLoyalty(customer.id);
      if (loyalty) {
        customer.loyalty = loyalty;
      }
    } catch (error) {
      // Continue without loyalty data
    }

    return customer;
  } catch (error) {
    return null;
  }
};

export const getCustomer = getCustomerById;
