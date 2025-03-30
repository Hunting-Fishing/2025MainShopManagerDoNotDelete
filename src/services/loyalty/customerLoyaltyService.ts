
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
    if (error.code === "PGRST116") {
      // No loyalty record found
      return null;
    }
    console.error("Error fetching customer loyalty:", error);
    throw error;
  }

  if (!data) return null;

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

// Create a new customer loyalty record
export const createCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty> => {
  const newLoyalty = {
    customer_id: customerId,
    current_points: 0,
    lifetime_points: 0,
    lifetime_value: 0,
    tier: "Standard"
  };

  const { data, error } = await supabase
    .from("customer_loyalty")
    .insert(newLoyalty)
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

// Update customer loyalty points
export const updateCustomerLoyaltyPoints = async (
  customerId: string,
  pointsToAdd: number
): Promise<CustomerLoyalty> => {
  // First, try to get the existing loyalty record
  const existing = await getCustomerLoyalty(customerId);

  if (!existing) {
    // If no loyalty record exists, create a new one
    return createCustomerLoyalty(customerId);
  } else {
    // Update the existing record
    const updatedPoints = existing.current_points + pointsToAdd;
    const updatedLifetimePoints = existing.lifetime_points + pointsToAdd;

    const { data, error } = await supabase
      .from("customer_loyalty")
      .update({
        current_points: updatedPoints,
        lifetime_points: updatedLifetimePoints,
        updated_at: new Date().toISOString(),
      })
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
      current_points: data.current_points,
      lifetime_points: data.lifetime_points,
      lifetime_value: data.lifetime_value,
      tier: data.tier,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
};

// Add more loyalty-related functions as needed
