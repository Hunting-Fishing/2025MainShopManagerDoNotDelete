
import { supabase } from "@/lib/supabase";
import { CustomerLoyalty } from "@/types/loyalty";
import { calculateTier } from './tierService';

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
export const createCustomerLoyalty = async (customerId: string, shopId: string): Promise<CustomerLoyalty> => {
  // Get the starting tier
  const defaultTier = await calculateTier(0, shopId);

  const newLoyalty = {
    customer_id: customerId,
    current_points: 0,
    lifetime_points: 0,
    lifetime_value: 0,
    tier: defaultTier.name
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
  pointsToAdd: number,
  shopId: string,
  amountSpent?: number
): Promise<CustomerLoyalty> => {
  // First, try to get the existing loyalty record
  let loyalty = await getCustomerLoyalty(customerId);
  
  if (!loyalty) {
    // If no loyalty record exists, create a new one
    loyalty = await createCustomerLoyalty(customerId, shopId);
  }
  
  // Calculate new point values
  const updatedCurrentPoints = loyalty.current_points + pointsToAdd;
  const updatedLifetimePoints = loyalty.lifetime_points + (pointsToAdd > 0 ? pointsToAdd : 0);
  const updatedLifetimeValue = amountSpent ? loyalty.lifetime_value + amountSpent : loyalty.lifetime_value;
  
  // Get appropriate tier based on lifetime points
  const newTier = await calculateTier(updatedLifetimePoints, shopId);
  
  // Update the customer loyalty record
  const { data, error } = await supabase
    .from("customer_loyalty")
    .update({
      current_points: updatedCurrentPoints,
      lifetime_points: updatedLifetimePoints,
      lifetime_value: updatedLifetimeValue,
      tier: newTier.name,
      updated_at: new Date().toISOString()
    })
    .eq("id", loyalty.id)
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

// Get loyalty summary statistics
export const getLoyaltyStats = async (shopId: string): Promise<{
  totalCustomers: number;
  totalPointsIssued: number;
  totalRedemptions: number;
  averagePointsPerCustomer: number;
}> => {
  // Get customer count with loyalty accounts
  const { count: customerCount, error: customerError } = await supabase
    .from("customer_loyalty")
    .select("*", { count: 'exact', head: true })
    .eq("customer_id", "customer_id");
    
  if (customerError) {
    console.error("Error getting loyalty customer count:", customerError);
    throw customerError;
  }
  
  // Get sum of all points issued (from transactions)
  const { data: pointsData, error: pointsError } = await supabase
    .from("loyalty_transactions")
    .select("points")
    .gt("points", 0);
    
  if (pointsError) {
    console.error("Error getting total points issued:", pointsError);
    throw pointsError;
  }
  
  // Get total redemptions count
  const { count: redemptionsCount, error: redemptionsError } = await supabase
    .from("loyalty_redemptions")
    .select("*", { count: 'exact', head: true });
    
  if (redemptionsError) {
    console.error("Error getting redemptions count:", redemptionsError);
    throw redemptionsError;
  }
  
  // Calculate total points issued
  const totalPointsIssued = pointsData?.reduce((sum, transaction) => sum + transaction.points, 0) || 0;
  
  // Calculate average points per customer
  const averagePointsPerCustomer = customerCount && customerCount > 0 
    ? Math.round(totalPointsIssued / customerCount) 
    : 0;
  
  return {
    totalCustomers: customerCount || 0,
    totalPointsIssued,
    totalRedemptions: redemptionsCount || 0,
    averagePointsPerCustomer
  };
};

// Process expired points
export const processExpiredPoints = async (shopId: string): Promise<number> => {
  // Get loyalty settings to determine expiration period
  const { data: settings, error: settingsError } = await supabase
    .from("loyalty_settings")
    .select("points_expiration_days")
    .eq("shop_id", shopId)
    .single();
    
  if (settingsError) {
    console.error("Error fetching loyalty settings:", settingsError);
    throw settingsError;
  }
  
  if (!settings || !settings.points_expiration_days) {
    return 0; // No expiration configured
  }
  
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - settings.points_expiration_days);
  const expirationDateStr = expirationDate.toISOString();
  
  // Find transactions that are eligible for expiration
  const { data: transactions, error: transactionsError } = await supabase
    .from("loyalty_transactions")
    .select("id, customer_id, points")
    .eq("transaction_type", "earn")
    .lt("created_at", expirationDateStr)
    .is("expired", false);
    
  if (transactionsError) {
    console.error("Error fetching expiring transactions:", transactionsError);
    throw transactionsError;
  }
  
  if (!transactions || transactions.length === 0) {
    return 0; // No transactions to expire
  }
  
  let totalPointsExpired = 0;
  
  // Process each expiring transaction
  for (const transaction of transactions) {
    // Create expiration record
    const { error: expireError } = await supabase
      .from("loyalty_transactions")
      .insert({
        customer_id: transaction.customer_id,
        points: -Math.abs(transaction.points),
        transaction_type: "expire",
        description: "Points expired",
        reference_id: transaction.id,
        reference_type: "expiration"
      });
      
    if (expireError) {
      console.error("Error creating expiration record:", expireError);
      continue;
    }
    
    // Mark original transaction as expired
    const { error: updateError } = await supabase
      .from("loyalty_transactions")
      .update({ expired: true })
      .eq("id", transaction.id);
      
    if (updateError) {
      console.error("Error marking transaction as expired:", updateError);
      continue;
    }
    
    // Update customer's current points
    const { error: customerError } = await supabase
      .rpc("adjust_customer_points", {
        p_customer_id: transaction.customer_id,
        p_points: -Math.abs(transaction.points)
      });
      
    if (customerError) {
      console.error("Error adjusting customer points:", customerError);
      continue;
    }
    
    totalPointsExpired += transaction.points;
  }
  
  return totalPointsExpired;
};
