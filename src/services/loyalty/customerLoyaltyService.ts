
import { supabase } from "@/integrations/supabase/client";
import { CustomerLoyalty } from "@/types/loyalty";

// Get customer loyalty information
export const getCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .select("*")
    .eq("customer_id", customerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No loyalty record found
    }
    console.error("Error fetching customer loyalty:", error);
    throw error;
  }

  return {
    id: data.id,
    customer_id: data.customer_id,
    points_balance: data.points_balance,
    lifetime_points: data.lifetime_points,
    tier: data.tier,
    tier_start_date: data.tier_start_date,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Create customer loyalty profile
export const createCustomerLoyalty = async (customerId: string, shopId: string): Promise<CustomerLoyalty> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .insert({
      customer_id: customerId,
      points_balance: 0,
      lifetime_points: 0,
      tier: 'Bronze',
      tier_start_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating customer loyalty:", error);
    throw error;
  }

  return {
    id: data.id,
    customer_id: data.customer_id,
    points_balance: data.points_balance,
    lifetime_points: data.lifetime_points,
    tier: data.tier,
    tier_start_date: data.tier_start_date,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Ensure customer has loyalty profile
export const ensureCustomerLoyalty = async (customerId: string, shopId: string = '1'): Promise<CustomerLoyalty> => {
  let loyalty = await getCustomerLoyalty(customerId);
  
  if (!loyalty) {
    loyalty = await createCustomerLoyalty(customerId, shopId);
  }
  
  return loyalty;
};

// Update customer loyalty
export const updateCustomerLoyalty = async (customerId: string, updates: Partial<CustomerLoyalty>): Promise<CustomerLoyalty> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .update(updates)
    .eq("customer_id", customerId)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer loyalty:", error);
    throw error;
  }

  return {
    id: data.id,
    customer_id: data.customer_id,
    points_balance: data.points_balance,
    lifetime_points: data.lifetime_points,
    tier: data.tier,
    tier_start_date: data.tier_start_date,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};
