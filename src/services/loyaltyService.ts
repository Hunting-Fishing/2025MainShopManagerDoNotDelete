
import { supabase } from "@/integrations/supabase/client";
import { 
  LoyaltySettings, 
  CustomerLoyalty, 
  LoyaltyTransaction, 
  LoyaltyReward, 
  LoyaltyRedemption,
  LoyaltyTier,
  DEFAULT_LOYALTY_TIERS
} from "@/types/loyalty";
import { toast } from "sonner";

// Get loyalty settings for a shop
export const getLoyaltySettings = async (shopId: string): Promise<LoyaltySettings | null> => {
  const { data, error } = await supabase
    .from("loyalty_settings")
    .select("*")
    .eq("shop_id", shopId)
    .single();

  if (error) {
    console.error("Error fetching loyalty settings:", error);
    // If no settings found, create default settings
    if (error.code === 'PGRST116') {
      return createDefaultLoyaltySettings(shopId);
    }
    throw error;
  }

  return data;
};

// Create default loyalty settings
export const createDefaultLoyaltySettings = async (shopId: string): Promise<LoyaltySettings> => {
  const defaultSettings = {
    shop_id: shopId,
    is_enabled: false,
    points_per_dollar: 1.0,
    points_expiration_days: 365
  };

  const { data, error } = await supabase
    .from("loyalty_settings")
    .insert(defaultSettings)
    .select()
    .single();

  if (error) {
    console.error("Error creating default loyalty settings:", error);
    throw error;
  }

  return data;
};

// Update loyalty settings
export const updateLoyaltySettings = async (settings: Partial<LoyaltySettings>): Promise<LoyaltySettings> => {
  const { data, error } = await supabase
    .from("loyalty_settings")
    .update(settings)
    .eq("id", settings.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating loyalty settings:", error);
    throw error;
  }

  return data;
};

// Toggle loyalty program enabled status
export const toggleLoyaltyProgramEnabled = async (settingsId: string, isEnabled: boolean): Promise<LoyaltySettings> => {
  const { data, error } = await supabase
    .from("loyalty_settings")
    .update({ is_enabled: isEnabled })
    .eq("id", settingsId)
    .select()
    .single();

  if (error) {
    console.error("Error toggling loyalty program:", error);
    throw error;
  }

  return data;
};

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

// Add points to customer
export const addCustomerPoints = async (
  customerId: string, 
  points: number, 
  transactionType: 'earn' | 'adjust', 
  description?: string,
  referenceId?: string,
  referenceType?: string
): Promise<{ loyalty: CustomerLoyalty, transaction: LoyaltyTransaction }> => {
  // First, get current loyalty data
  let loyalty = await getCustomerLoyalty(customerId);
  
  if (!loyalty) {
    loyalty = await createCustomerLoyalty(customerId);
  }

  // Calculate new values
  const newCurrentPoints = loyalty.current_points + points;
  const newLifetimePoints = loyalty.lifetime_points + (points > 0 ? points : 0); // Only add positive points to lifetime
  
  // Update tier based on lifetime points
  const newTier = calculateTier(newLifetimePoints);

  // Create transaction record
  const transaction = await createLoyaltyTransaction({
    customer_id: customerId,
    points,
    transaction_type: transactionType,
    description,
    reference_id: referenceId,
    reference_type: referenceType
  });

  // Update loyalty record
  const { data, error } = await supabase
    .from("customer_loyalty")
    .update({
      current_points: newCurrentPoints,
      lifetime_points: newLifetimePoints,
      tier: newTier
    })
    .eq("id", loyalty.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer loyalty:", error);
    throw error;
  }

  return { loyalty: data, transaction };
};

// Function to calculate tier based on lifetime points
export const calculateTier = (lifetimePoints: number): string => {
  const tiers = DEFAULT_LOYALTY_TIERS.slice().sort((a, b) => b.threshold - a.threshold);
  
  for (const tier of tiers) {
    if (lifetimePoints >= tier.threshold) {
      return tier.name;
    }
  }
  
  return 'Standard'; // Default tier
};

// Get tier details by name
export const getTierByName = (tierName: string): LoyaltyTier => {
  return DEFAULT_LOYALTY_TIERS.find(tier => tier.name === tierName) || DEFAULT_LOYALTY_TIERS[0];
};

// Create a loyalty transaction
export const createLoyaltyTransaction = async (transaction: {
  customer_id: string;
  points: number;
  transaction_type: 'earn' | 'redeem' | 'expire' | 'adjust';
  description?: string;
  reference_id?: string;
  reference_type?: string;
}): Promise<LoyaltyTransaction> => {
  const { data, error } = await supabase
    .from("loyalty_transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error("Error creating loyalty transaction:", error);
    throw error;
  }

  return data as LoyaltyTransaction;
};

// Get loyalty transactions for a customer
export const getCustomerTransactions = async (customerId: string): Promise<LoyaltyTransaction[]> => {
  const { data, error } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer transactions:", error);
    throw error;
  }

  return data as LoyaltyTransaction[];
};

// Get available rewards
export const getAvailableRewards = async (shopId: string): Promise<LoyaltyReward[]> => {
  const { data, error } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .eq("shop_id", shopId)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching available rewards:", error);
    throw error;
  }

  return data as LoyaltyReward[];
};

// Create a new reward
export const createReward = async (reward: {
  shop_id: string;
  name: string;
  description?: string;
  points_cost: number;
  is_active: boolean;
  reward_type: 'discount' | 'service' | 'product' | 'other';
  reward_value?: number;
}): Promise<LoyaltyReward> => {
  const { data, error } = await supabase
    .from("loyalty_rewards")
    .insert(reward)
    .select()
    .single();

  if (error) {
    console.error("Error creating reward:", error);
    throw error;
  }

  return data as LoyaltyReward;
};

// Update a reward
export const updateReward = async (reward: Partial<LoyaltyReward> & { id: string }): Promise<LoyaltyReward> => {
  const { data, error } = await supabase
    .from("loyalty_rewards")
    .update(reward)
    .eq("id", reward.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating reward:", error);
    throw error;
  }

  return data as LoyaltyReward;
};

// Delete a reward
export const deleteReward = async (rewardId: string): Promise<void> => {
  const { error } = await supabase
    .from("loyalty_rewards")
    .delete()
    .eq("id", rewardId);

  if (error) {
    console.error("Error deleting reward:", error);
    throw error;
  }
};

// Redeem points for a reward
export const redeemPoints = async (
  customerId: string, 
  rewardId: string, 
  pointsCost: number
): Promise<{ redemption: LoyaltyRedemption, updatedLoyalty: CustomerLoyalty }> => {
  // First, check if customer has enough points
  const loyalty = await getCustomerLoyalty(customerId);
  
  if (!loyalty) {
    throw new Error("Customer loyalty profile not found");
  }
  
  if (loyalty.current_points < pointsCost) {
    throw new Error("Customer does not have enough points for this reward");
  }
  
  // Create redemption record
  const { data: redemption, error: redemptionError } = await supabase
    .from("loyalty_redemptions")
    .insert({
      customer_id: customerId,
      reward_id: rewardId,
      points_used: pointsCost,
      status: 'pending' as const
    })
    .select()
    .single();
    
  if (redemptionError) {
    console.error("Error creating redemption:", redemptionError);
    throw redemptionError;
  }
  
  // Create transaction record for the redemption
  await createLoyaltyTransaction({
    customer_id: customerId,
    points: -pointsCost,
    transaction_type: 'redeem',
    description: `Reward redemption`,
    reference_id: redemption.id,
    reference_type: 'redemption'
  });
  
  // Update customer points
  const { data: updatedLoyalty, error: updateError } = await supabase
    .from("customer_loyalty")
    .update({
      current_points: loyalty.current_points - pointsCost
    })
    .eq("id", loyalty.id)
    .select()
    .single();
    
  if (updateError) {
    console.error("Error updating customer points:", updateError);
    throw updateError;
  }
  
  return { 
    redemption: redemption as LoyaltyRedemption, 
    updatedLoyalty: updatedLoyalty as CustomerLoyalty 
  };
};

// Get customer redemptions
export const getCustomerRedemptions = async (customerId: string): Promise<LoyaltyRedemption[]> => {
  const { data, error } = await supabase
    .from("loyalty_redemptions")
    .select(`
      *,
      reward:reward_id (*)
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer redemptions:", error);
    throw error;
  }

  return data as LoyaltyRedemption[];
};

// Update redemption status
export const updateRedemptionStatus = async (
  redemptionId: string, 
  status: 'pending' | 'completed' | 'cancelled',
  notes?: string
): Promise<LoyaltyRedemption> => {
  const updates: any = { status };
  
  if (status === 'completed' && !notes) {
    updates.used_at = new Date().toISOString();
  }
  
  if (notes) {
    updates.notes = notes;
  }
  
  const { data, error } = await supabase
    .from("loyalty_redemptions")
    .update(updates)
    .eq("id", redemptionId)
    .select(`
      *,
      reward:reward_id (*)
    `)
    .single();

  if (error) {
    console.error("Error updating redemption status:", error);
    throw error;
  }

  // If cancelling, refund the points
  if (status === 'cancelled') {
    try {
      // Get the redemption data
      const redemption = data as LoyaltyRedemption;
      
      // Refund points
      await addCustomerPoints(
        redemption.customer_id,
        redemption.points_used,
        'adjust',
        'Points refunded from cancelled redemption',
        redemption.id,
        'refund'
      );
      
      toast.success("Points have been refunded to the customer");
    } catch (err) {
      console.error("Error refunding points:", err);
      toast.error("Error refunding points");
    }
  }

  return data as LoyaltyRedemption;
};

// Calculate lifetime value from invoices and update customer loyalty
export const updateCustomerLifetimeValue = async (customerId: string): Promise<CustomerLoyalty> => {
  // This would normally calculate from invoice history
  // For simplicity, we're using a placeholder implementation
  
  // Get current loyalty profile
  const loyalty = await getCustomerLoyalty(customerId);
  
  if (!loyalty) {
    throw new Error("Customer loyalty profile not found");
  }
  
  // In a real implementation, you would fetch all invoices and sum up totals
  // Then calculate points based on settings.points_per_dollar
  
  // For now, we'll use a placeholder implementation
  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .select("total")
    .like("customer", `%${customerId}%`);
    
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

// Export the tier definitions for use in components
export { DEFAULT_LOYALTY_TIERS };
