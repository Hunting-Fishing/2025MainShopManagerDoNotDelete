
import { supabase } from "@/integrations/supabase/client";
import { CustomerLoyalty } from "@/types/loyalty";

/**
 * Get customer loyalty data by customer ID
 */
export const getCustomerLoyalty = async (customerId: string): Promise<CustomerLoyalty | null> => {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No loyalty record found
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      customer_id: data.customer_id,
      points_balance: data.points_balance || 0,
      lifetime_points: data.lifetime_points || 0,
      lifetime_value: data.lifetime_value || 0,
      tier: data.tier || 'Standard',
      tier_start_date: data.tier_start_date || data.created_at,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching customer loyalty:', error);
    return null;
  }
};

/**
 * Create initial loyalty record for a customer
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

    return {
      id: data.id,
      customer_id: data.customer_id,
      points_balance: data.points_balance,
      lifetime_points: data.lifetime_points,
      lifetime_value: data.lifetime_value,
      tier: data.tier,
      tier_start_date: data.tier_start_date,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error creating customer loyalty:', error);
    return null;
  }
};

/**
 * Update customer loyalty points and tier
 */
export const updateCustomerLoyalty = async (
  customerId: string,
  updates: Partial<CustomerLoyalty>
): Promise<CustomerLoyalty | null> => {
  try {
    const updateData: any = {};
    
    if (updates.points_balance !== undefined) {
      updateData.points_balance = updates.points_balance;
    }
    if (updates.lifetime_value !== undefined) {
      updateData.lifetime_value = updates.lifetime_value;
    }
    if (updates.tier !== undefined) {
      updateData.tier = updates.tier;
    }
    if (updates.tier_start_date !== undefined) {
      updateData.tier_start_date = updates.tier_start_date;
    }

    const { data, error } = await supabase
      .from('customer_loyalty')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', customerId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      customer_id: data.customer_id,
      points_balance: data.points_balance,
      lifetime_points: data.lifetime_points,
      lifetime_value: data.lifetime_value,
      tier: data.tier,
      tier_start_date: data.tier_start_date,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error updating customer loyalty:', error);
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
      .order('lifetime_value', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      customer_id: item.customer_id,
      points_balance: item.points_balance || 0,
      lifetime_points: item.lifetime_points || 0,
      lifetime_value: item.lifetime_value || 0,
      tier: item.tier || 'Standard',
      tier_start_date: item.tier_start_date || item.created_at,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Error fetching all customer loyalty records:', error);
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
      .order('lifetime_value', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      customer_id: item.customer_id,
      points_balance: item.points_balance || 0,
      lifetime_points: item.lifetime_points || 0,
      lifetime_value: item.lifetime_value || 0,
      tier: item.tier || 'Standard',
      tier_start_date: item.tier_start_date || item.created_at,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Error fetching customers by tier:', error);
    return [];
  }
};

/**
 * Get top customers by lifetime value
 */
export const getTopCustomersByValue = async (limit: number = 10): Promise<CustomerLoyalty[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('*')
      .order('lifetime_value', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      customer_id: item.customer_id,
      points_balance: item.points_balance || 0,
      lifetime_points: item.lifetime_points || 0,
      lifetime_value: item.lifetime_value || 0,
      tier: item.tier || 'Standard',
      tier_start_date: item.tier_start_date || item.created_at,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Error fetching top customers by value:', error);
    return [];
  }
};
