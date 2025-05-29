
import { supabase } from "@/integrations/supabase/client";
import { CustomerLoyalty } from "@/types/loyalty";

export const getCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .select("*")
    .eq("customer_id", customerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Customer loyalty record not found
    }
    console.error("Error fetching customer loyalty:", error);
    throw error;
  }

  return {
    id: data.id,
    customer_id: data.customer_id,
    current_points: data.current_points,
    lifetime_points: data.lifetime_points,
    lifetime_value: data.lifetime_value,
    tier: data.tier,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const createCustomerLoyalty = async (customerId: string, shopId: string): Promise<CustomerLoyalty> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .insert({
      customer_id: customerId,
      current_points: 0,
      lifetime_points: 0,
      lifetime_value: 0,
      tier: 'bronze'
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
    current_points: data.current_points,
    lifetime_points: data.lifetime_points,
    lifetime_value: data.lifetime_value,
    tier: data.tier,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const updateCustomerLoyalty = async (loyaltyId: string, updates: Partial<CustomerLoyalty>): Promise<CustomerLoyalty> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .update({
      current_points: updates.current_points,
      lifetime_points: updates.lifetime_points,
      lifetime_value: updates.lifetime_value,
      tier: updates.tier
    })
    .eq("id", loyaltyId)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer loyalty:", error);
    throw error;
  }

  return {
    id: data.id,
    customer_id: data.customer_id,
    current_points: data.current_points,
    lifetime_points: data.lifetime_points,
    lifetime_value: data.lifetime_value,
    tier: data.tier,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const getAllCustomerLoyalty = async (): Promise<CustomerLoyalty[]> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .select("*")
    .order("lifetime_points", { ascending: false });

  if (error) {
    console.error("Error fetching all customer loyalty:", error);
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    customer_id: item.customer_id,
    current_points: item.current_points,
    lifetime_points: item.lifetime_points,
    lifetime_value: item.lifetime_value,
    tier: item.tier,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
};

export const getCustomersByTier = async (tier: string): Promise<CustomerLoyalty[]> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .select("*")
    .eq("tier", tier)
    .order("current_points", { ascending: false });

  if (error) {
    console.error("Error fetching customers by tier:", error);
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    customer_id: item.customer_id,
    current_points: item.current_points,
    lifetime_points: item.lifetime_points,
    lifetime_value: item.lifetime_value,
    tier: item.tier,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
};

export const getTopCustomers = async (limit: number = 10): Promise<CustomerLoyalty[]> => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .select("*")
    .order("lifetime_points", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top customers:", error);
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    customer_id: item.customer_id,
    current_points: item.current_points,
    lifetime_points: item.lifetime_points,
    lifetime_value: item.lifetime_value,
    tier: item.tier,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
};

export const getExpiredPoints = async (customerId: string): Promise<number> => {
  // Since we don't have an expiration system in the current schema,
  // return 0 for now
  return 0;
};

export const getLoyaltyAnalytics = async () => {
  const { data, error } = await supabase
    .from("customer_loyalty")
    .select("current_points, lifetime_points, tier");

  if (error) {
    console.error("Error fetching loyalty analytics:", error);
    throw error;
  }

  const analytics = {
    totalMembers: data?.length || 0,
    totalPointsIssued: data?.reduce((sum, customer) => sum + (customer.lifetime_points || 0), 0) || 0,
    activePoints: data?.reduce((sum, customer) => sum + (customer.current_points || 0), 0) || 0,
    tierDistribution: data?.reduce((acc: Record<string, number>, customer) => {
      acc[customer.tier || 'bronze'] = (acc[customer.tier || 'bronze'] || 0) + 1;
      return acc;
    }, {}) || {}
  };

  return analytics;
};
