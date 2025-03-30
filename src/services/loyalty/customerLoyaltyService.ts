import { supabase } from "@/integrations/supabase/client";
import { CustomerLoyalty } from "@/types/loyalty";
import { calculateTier } from './tierService';

// Get customer loyalty profile
export const getCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .select("*")
    .eq("customer_id", customerId)
    .single();

  if (error) {
    // If no loyalty profile found, create a default one
    if (error.code === 'PGRST116') {
      return createCustomerLoyalty(customerId);
    }
    console.error("Error fetching customer loyalty:", error);
    throw error;
  }

  return data;
};

// Create customer loyalty profile
export const createCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty> => {
  const defaultLoyalty = {
    customer_id: customerId,
    current_points: 0,
    lifetime_points: 0,
    lifetime_value: 0,
    tier: 'Standard'
  };

  const { data, error } = await supabase
    .from("customer_loyalty")
    .insert(defaultLoyalty)
    .select()
    .single();

  if (error) {
    console.error("Error creating customer loyalty:", error);
    throw error;
  }

  return data;
};

// Calculate lifetime value from invoices and update customer loyalty
export const updateCustomerLifetimeValue = async (customerId: string): Promise<CustomerLoyalty> => {
  // Get current loyalty profile
  const loyalty = await getCustomerLoyalty(customerId);
  
  if (!loyalty) {
    throw new Error("Customer loyalty profile not found");
  }
  
  // In a real implementation, you would fetch all invoices and sum up totals
  // Then calculate points based on settings.points_per_dollar
  
  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .select("total")
    .like("customer", `%${customerId.toString()}%`);
    
  if (invoiceError) {
    console.error("Error fetching invoices:", invoiceError);
    throw invoiceError;
  }
  
  // Calculate lifetime value from invoices
  const lifetimeValue = invoiceData?.reduce((total, invoice) => total + (parseFloat(invoice.total) || 0), 0) || 0;
  
  // Update loyalty record
  const { data, error } = await supabase
    .from("customer_loyalty")
    .update({
      lifetime_value: lifetimeValue
    })
    .eq("id", loyalty.id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating customer lifetime value:", error);
    throw error;
  }
  
  return data as CustomerLoyalty;
};
