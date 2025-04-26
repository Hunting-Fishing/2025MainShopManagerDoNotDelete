
import { supabase } from "@/lib/supabase";
import { CustomerLoyalty } from "@/types/loyalty";

/**
 * Get customer loyalty data
 */
export const getCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  try {
    const { data, error } = await supabase
      .from("customer_loyalty")
      .select("*")
      .eq("customer_id", customerId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No results found, customer doesn't have loyalty info yet
        return null;
      }
      console.error("Error fetching customer loyalty:", error);
      throw error;
    }
    
    return data as CustomerLoyalty;
  } catch (error) {
    console.error("Error in getCustomerLoyalty:", error);
    return null;
  }
};

/**
 * Update customer loyalty points
 */
export const updateCustomerLoyaltyPoints = async (
  customerId: string,
  points: number
): Promise<CustomerLoyalty | null> => {
  try {
    // First check if customer has loyalty record
    const existing = await getCustomerLoyalty(customerId);
    
    if (!existing) {
      // Create new loyalty record
      const { data, error } = await supabase
        .from("customer_loyalty")
        .insert({
          customer_id: customerId,
          current_points: points,
          lifetime_points: points,
          lifetime_value: 0
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating customer loyalty:", error);
        throw error;
      }
      
      return data as CustomerLoyalty;
    } else {
      // Update existing record
      const newCurrentPoints = existing.current_points + points;
      const newLifetimePoints = existing.lifetime_points + (points > 0 ? points : 0);
      
      const { data, error } = await supabase
        .from("customer_loyalty")
        .update({
          current_points: newCurrentPoints,
          lifetime_points: newLifetimePoints,
        })
        .eq("customer_id", customerId)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating customer loyalty:", error);
        throw error;
      }
      
      return data as CustomerLoyalty;
    }
  } catch (error) {
    console.error("Error in updateCustomerLoyaltyPoints:", error);
    throw error;
  }
};
