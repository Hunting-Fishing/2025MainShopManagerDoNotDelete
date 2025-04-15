
import { supabase } from "@/lib/supabase";
import { CustomerLoyalty } from "@/types/loyalty";
import { calculateTier } from './tierService';

export const getCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  if (!customerId) return null;
  
  try {
    const { data, error } = await supabase
      .from("customer_loyalty")
      .select("*")
      .eq("customer_id", customerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No loyalty record found - create one
        return createCustomerLoyalty(customerId);
      }
      console.error("Error fetching customer loyalty:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCustomerLoyalty:", error);
    return null;
  }
};

export const createCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  if (!customerId) return null;
  
  try {
    const { data, error } = await supabase
      .from("customer_loyalty")
      .insert({
        customer_id: customerId,
        current_points: 0,
        lifetime_points: 0,
        lifetime_value: 0,
        tier: 'Standard'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating customer loyalty:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in createCustomerLoyalty:", error);
    return null;
  }
};
