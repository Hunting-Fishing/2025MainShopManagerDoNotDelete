
import { supabase } from "@/integrations/supabase/client";

export interface CustomerLoyalty {
  id: string;
  customerId: string;
  currentPoints: number;
  lifetimePoints: number;
  lifetimeValue: number;
  tier: string;
  createdAt: string;
  updatedAt: string;
}

// Fetch a customer's loyalty details
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
    customerId: data.customer_id,
    currentPoints: data.current_points,
    lifetimePoints: data.lifetime_points,
    lifetimeValue: data.lifetime_value,
    tier: data.tier,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Initialize loyalty account for a customer
export const initializeCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty> => {
  // Check if account already exists
  const existing = await getCustomerLoyalty(customerId);
  if (existing) {
    return existing;
  }

  // Create new loyalty account
  const { data, error } = await supabase
    .from("customer_loyalty")
    .insert({
      customer_id: customerId,
      current_points: 0,
      lifetime_points: 0,
      lifetime_value: 0,
      tier: "Standard",
    })
    .select()
    .single();

  if (error) {
    console.error("Error initializing customer loyalty:", error);
    throw error;
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    currentPoints: data.current_points,
    lifetimePoints: data.lifetime_points,
    lifetimeValue: data.lifetime_value,
    tier: data.tier,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Add points to a customer's loyalty account
export const addLoyaltyPoints = async (
  customerId: string,
  points: number,
  transactionType: string,
  referenceId?: string,
  description?: string
): Promise<void> => {
  // Get current loyalty data
  let loyalty = await getCustomerLoyalty(customerId);
  
  // If customer doesn't have a loyalty account, create one
  if (!loyalty) {
    loyalty = await initializeCustomerLoyalty(customerId);
  }
  
  // Update points
  const { error: updateError } = await supabase
    .from("customer_loyalty")
    .update({
      current_points: loyalty.currentPoints + points,
      lifetime_points: loyalty.lifetimePoints + points,
    })
    .eq("customer_id", customerId);

  if (updateError) {
    console.error("Error updating loyalty points:", updateError);
    throw updateError;
  }
  
  // Record the transaction
  const { error: transactionError } = await supabase
    .from("loyalty_transactions")
    .insert({
      customer_id: customerId,
      points: points,
      transaction_type: transactionType,
      reference_id: referenceId,
      description: description,
    });

  if (transactionError) {
    console.error("Error recording loyalty transaction:", transactionError);
    throw transactionError;
  }
};
