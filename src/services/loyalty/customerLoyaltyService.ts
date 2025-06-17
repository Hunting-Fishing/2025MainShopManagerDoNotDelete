
import { supabase } from "@/integrations/supabase/client";
import { CustomerLoyalty } from "@/types/loyalty";

/**
 * Get customer loyalty data
 */
export const getCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('customer_id', customerId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching customer loyalty:', error);
    return null;
  }
};

/**
 * Create customer loyalty record
 */
export const createCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .insert({
        customer_id: customerId,
        points_balance: 0,
        lifetime_points: 0,
        lifetime_value: 0,
        tier: 'Standard',
        tier_start_date: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating customer loyalty:', error);
    return null;
  }
};

/**
 * Ensure customer loyalty record exists, create if it doesn't
 */
export const ensureCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  try {
    // First try to get existing loyalty record
    let loyaltyData = await getCustomerLoyalty(customerId);
    
    // If no record exists, create one
    if (!loyaltyData) {
      loyaltyData = await createCustomerLoyalty(customerId);
    }
    
    return loyaltyData;
  } catch (error) {
    console.error('Error ensuring customer loyalty:', error);
    return null;
  }
};

/**
 * Update customer loyalty points
 */
export const updateCustomerLoyalty = async (
  customerId: string, 
  updates: Partial<CustomerLoyalty>
): Promise<CustomerLoyalty | null> => {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .update(updates)
      .eq('customer_id', customerId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating customer loyalty:', error);
    return null;
  }
};

/**
 * Add points to customer account
 */
export const addPointsToCustomer = async (
  customerId: string, 
  points: number
): Promise<CustomerLoyalty | null> => {
  try {
    // Ensure loyalty record exists
    const loyaltyData = await ensureCustomerLoyalty(customerId);
    if (!loyaltyData) return null;
    
    const updatedBalance = loyaltyData.points_balance + points;
    const updatedLifetimePoints = loyaltyData.lifetime_points + points;
    
    return await updateCustomerLoyalty(customerId, {
      points_balance: updatedBalance,
      lifetime_points: updatedLifetimePoints
    });
  } catch (error) {
    console.error('Error adding points to customer:', error);
    return null;
  }
};

/**
 * Deduct points from customer account
 */
export const deductPointsFromCustomer = async (
  customerId: string, 
  points: number
): Promise<CustomerLoyalty | null> => {
  try {
    const loyaltyData = await getCustomerLoyalty(customerId);
    if (!loyaltyData) return null;
    
    if (loyaltyData.points_balance < points) {
      throw new Error('Insufficient points balance');
    }
    
    const updatedBalance = loyaltyData.points_balance - points;
    
    return await updateCustomerLoyalty(customerId, {
      points_balance: updatedBalance
    });
  } catch (error) {
    console.error('Error deducting points from customer:', error);
    return null;
  }
};

/**
 * Get all customer loyalty records
 */
export const getAllCustomerLoyalty = async (): Promise<CustomerLoyalty[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('*')
      .order('lifetime_points', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching all customer loyalty:', error);
    return [];
  }
};

/**
 * Get customers by loyalty tier
 */
export const getCustomersByTier = async (tier: string): Promise<CustomerLoyalty[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('tier', tier)
      .order('lifetime_points', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching customers by tier:', error);
    return [];
  }
};

/**
 * Get top customers by points
 */
export const getTopCustomersByPoints = async (limit: number = 10): Promise<CustomerLoyalty[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('*')
      .order('lifetime_points', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching top customers by points:', error);
    return [];
  }
};
