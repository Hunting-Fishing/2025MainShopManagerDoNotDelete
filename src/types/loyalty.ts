
export interface CustomerLoyalty {
  id: string;
  customer_id: string;
  points_balance: number;
  lifetime_points: number;
  tier: string;
  tier_start_date: string;
  created_at: string;
  updated_at: string;
  
  // Additional properties for compatibility
  current_points?: number;
  lifetime_value?: number;
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

export interface LoyaltyRedemption {
  id: string;
  customer_id: string;
  reward_id: string;
  points_used: number;
  status: 'pending' | 'completed' | 'cancelled';
  used_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  reward?: LoyaltyReward;
}

export interface LoyaltySettings {
  id: string;
  shop_id: string;
  is_enabled: boolean;
  points_per_dollar: number;
  points_expiration_days: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTier {
  id?: string;
  name: string;
  threshold: number;
  benefits: string;
  multiplier: number;
  color: string;
  shop_id?: string;
  created_at?: string;
  updated_at?: string;
}
