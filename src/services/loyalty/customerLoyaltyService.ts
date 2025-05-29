import { supabase } from '@/lib/supabase';
import { CustomerLoyalty } from '@/types/loyalty';

export const customerLoyaltyService = {
  async getCustomerLoyalty(customerId: string): Promise<CustomerLoyalty | null> {
    try {
      const { data, error } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (error) {
        console.error('Error fetching customer loyalty:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Failed to fetch customer loyalty:', error);
      return null;
    }
  },

  async createCustomerLoyalty(customerId: string): Promise<CustomerLoyalty | null> {
    try {
      const { data, error } = await supabase
        .from('customer_loyalty')
        .insert({ customer_id: customerId, points: 0 })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer loyalty:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Failed to create customer loyalty:', error);
      return null;
    }
  },

  async updateCustomerLoyalty(customerId: string, points: number): Promise<CustomerLoyalty | null> {
    try {
      const { data, error } = await supabase
        .from('customer_loyalty')
        .update({ points: points })
        .eq('customer_id', customerId)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer loyalty:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Failed to update customer loyalty:', error);
      return null;
    }
  },

  async applyPoints(customerId: string, points: number, description: string, referenceId: string, referenceType: string): Promise<CustomerLoyalty | null> {
    try {
      // Insert the transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: customerId,
          points: points,
          description: description,
          reference_id: referenceId,
          reference_type: referenceType,
          transaction_type: points > 0 ? 'earned' : 'redeemed'
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error creating loyalty transaction:', transactionError);
        throw transactionError;
      }

      // Update the customer's loyalty points
      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('customer_loyalty')
        .update({ points: () => `points + ${points}` })
        .eq('customer_id', customerId)
        .select()
        .single();

      if (loyaltyError) {
        console.error('Error updating customer loyalty points:', loyaltyError);
        throw loyaltyError;
      }

      return loyaltyData || null;
    } catch (error) {
      console.error('Failed to apply points:', error);
      return null;
    }
  },

  async getCustomerTransactions(customerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch customer transactions:', error);
      return [];
    }
  },

  async createReward(reward: Omit<CustomerLoyalty, 'id'>): Promise<CustomerLoyalty | null> {
    try {
      const { data, error } = await supabase
        .from('customer_loyalty')
        .insert(reward)
        .select()
        .single();

      if (error) {
        console.error('Error creating reward:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Failed to create reward:', error);
      return null;
    }
  },

  async getRewards(): Promise<CustomerLoyalty[]> {
    try {
      const { data, error } = await supabase
        .from('customer_loyalty')
        .select('*');

      if (error) {
        console.error('Error fetching rewards:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      return [];
    }
  },

  async getReward(id: string): Promise<CustomerLoyalty | null> {
    try {
      const { data, error } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching reward:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Failed to fetch reward:', error);
      return null;
    }
  },

  async updateReward(id: string, updates: Partial<CustomerLoyalty>): Promise<CustomerLoyalty | null> {
    try {
      const { data, error } = await supabase
        .from('customer_loyalty')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reward:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Failed to update reward:', error);
      return null;
    }
  },

  async deleteReward(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customer_loyalty')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reward:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete reward:', error);
      return false;
    }
  },
  
  async getLoyaltySummary(): Promise<{ totalCustomers: number; totalPoints: number }> {
    try {
      // Fetch total number of customers with loyalty accounts
      const { count: totalCustomers, error: customerError } = await supabase
        .from('customer_loyalty')
        .select('*', { count: 'exact', head: true });

      if (customerError) {
        console.error('Error fetching total customers:', customerError);
        throw customerError;
      }

      // Fetch total number of loyalty points
      const { data: pointsData, error: pointsError } = await supabase
        .from('customer_loyalty')
        .select('points');

      if (pointsError) {
        console.error('Error fetching loyalty points:', pointsError);
        throw pointsError;
      }

      const totalPoints = pointsData?.reduce((sum, loyalty) => sum + (loyalty.points || 0), 0) || 0;

      return {
        totalCustomers: totalCustomers || 0,
        totalPoints: totalPoints,
      };
    } catch (error) {
      console.error('Error fetching loyalty summary:', error);
      return { totalCustomers: 0, totalPoints: 0 };
    }
  },

  async sendRewardNotification(customerId: string, rewardDetails: any): Promise<void> {
    try {
      // In a real application, you would integrate with a notification service
      // to send the reward details to the customer.
      console.log(`Sending reward notification to customer ${customerId}:`, rewardDetails);
      // Placeholder for notification service integration
    } catch (error) {
      console.error('Error sending reward notification:', error);
      throw error;
    }
  },

  async getExpiringPoints(days: number): Promise<any[]> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
  
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('customer_id, points, created_at')
        .eq('transaction_type', 'earned')
        .lte('created_at', expiryDate.toISOString());
  
      if (error) {
        console.error('Error fetching expiring points:', error);
        return [];
      }
  
      return data || [];
    } catch (error) {
      console.error('Failed to fetch expiring points:', error);
      return [];
    }
  }
};

export const processExpiredRewards = async (): Promise<void> => {
  try {
    console.log('Processing expired rewards...');
    
    // Find expired rewards that haven't been processed
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: expiredRewards, error: fetchError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('transaction_type', 'earned')
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    // Process each expired reward
    for (const reward of expiredRewards || []) {
      // Create expiration transaction without the invalid 'expired' field
      const { error: insertError } = await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: reward.customer_id,
          points: -reward.points,
          transaction_type: 'expired',
          description: `Points expired from transaction ${reward.id}`,
          reference_id: reward.id,
          reference_type: 'expiration'
        });

      if (insertError) {
        console.error('Error creating expiration transaction:', insertError);
        continue;
      }

      console.log(`Processed expiration for reward ${reward.id}`);
    }
  } catch (error) {
    console.error('Error processing expired rewards:', error);
    throw error;
  }
};
