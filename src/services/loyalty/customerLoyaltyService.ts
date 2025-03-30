
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
    customerId: data.customer_id,
    currentPoints: data.current_points,
    lifetimePoints: data.lifetime_points,
    lifetimeValue: data.lifetime_value,
    currentTier: data.current_tier,
    joinDate: data.join_date,
    lastActivity: data.last_activity
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
    const newLoyalty = {
      customer_id: customerId,
      current_points: pointsToAdd,
      lifetime_points: pointsToAdd,
      lifetime_value: 0,
      current_tier: "standard",
      join_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
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
      customerId: data.customer_id,
      currentPoints: data.current_points,
      lifetimePoints: data.lifetime_points,
      lifetimeValue: data.lifetime_value,
      currentTier: data.current_tier,
      joinDate: data.join_date,
      lastActivity: data.last_activity
    };
  } else {
    // Update the existing record
    const updatedPoints = existing.currentPoints + pointsToAdd;
    const updatedLifetimePoints = existing.lifetimePoints + pointsToAdd;

    const { data, error } = await supabase
      .from("customer_loyalty")
      .update({
        current_points: updatedPoints,
        lifetime_points: updatedLifetimePoints,
        last_activity: new Date().toISOString(),
      })
      .eq("customer_id", customerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer loyalty:", error);
      throw error;
    }

    return {
      customerId: data.customer_id,
      currentPoints: data.current_points,
      lifetimePoints: data.lifetime_points,
      lifetimeValue: data.lifetime_value,
      currentTier: data.current_tier,
      joinDate: data.join_date,
      lastActivity: data.last_activity
    };
  }
};

// Add more loyalty-related functions as needed
