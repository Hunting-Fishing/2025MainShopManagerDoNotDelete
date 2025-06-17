
export interface CustomerLoyalty {
  id: string;
  customer_id: string;
  points_balance: number;
  lifetime_points: number;
  tier: string;
  tier_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  points: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description?: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description?: string;
  reward_type: 'discount' | 'service' | 'product' | 'cashback';
  points_cost: number;
  reward_value?: number;
  is_active: boolean;
  shop_id?: string;
  created_at: string;
  updated_at: string;
}
