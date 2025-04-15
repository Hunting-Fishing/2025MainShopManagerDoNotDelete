
import { supabase } from "@/lib/supabase";
import { CustomerLoyalty, LoyaltyTransaction } from "@/types/loyalty";
import { getCustomerLoyalty, createCustomerLoyalty } from './customerLoyaltyService';
import { calculateTier } from './tierService';
import { 
  calculateNewPoints, 
  calculateNewLifetimePoints 
} from './utils/loyaltyCalculations';
import { createLoyaltyTransaction } from './transactions/loyaltyTransactionService';

export const addCustomerPoints = async (
  customerId: string, 
  points: number, 
  shopId: string,
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

  // Calculate new values using utility functions
  const newCurrentPoints = calculateNewPoints(loyalty.current_points, points);
  const newLifetimePoints = calculateNewLifetimePoints(loyalty.lifetime_points, points);
  
  // Update tier based on lifetime points
  const newTier = await calculateTier(newLifetimePoints, shopId);

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
      tier: newTier.name
    })
    .eq("id", loyalty.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer loyalty:", error);
    throw error;
  }

  return { 
    loyalty: {
      id: data.id,
      customer_id: data.customer_id,
      current_points: data.current_points,
      lifetime_points: data.lifetime_points,
      lifetime_value: data.lifetime_value,
      tier: data.tier,
      created_at: data.created_at,
      updated_at: data.updated_at
    }, 
    transaction 
  };
};

export { getCustomerTransactions } from './transactions/loyaltyTransactionService';
