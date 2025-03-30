
// Define loyalty program types
export interface LoyaltySettings {
  id: string;
  shop_id: string;
  is_enabled: boolean;
  points_per_dollar: number;
  points_expiration_days: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerLoyalty {
  id: string;
  customer_id: string;
  current_points: number;
  lifetime_points: number;
  lifetime_value: number;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  points: number;
  transaction_type: 'earn' | 'redeem' | 'expire' | 'adjust';
  description?: string;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  points_cost: number;
  is_active: boolean;
  reward_type: 'discount' | 'service' | 'product' | 'other';
  reward_value?: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyRedemption {
  id: string;
  customer_id: string;
  reward_id?: string;
  points_used: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  used_at?: string;
  notes?: string;
  reward?: LoyaltyReward;
}

// Tier definitions
export interface LoyaltyTier {
  name: string;
  threshold: number;
  perks: string[];
  color: string;
}

export const DEFAULT_LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'Standard',
    threshold: 0,
    perks: ['Basic member benefits'],
    color: 'bg-slate-500'
  },
  {
    name: 'Silver',
    threshold: 1000,
    perks: ['5% discount on services', 'Priority scheduling'],
    color: 'bg-gray-400'
  },
  {
    name: 'Gold',
    threshold: 5000,
    perks: ['10% discount on services', 'Free vehicle inspections', 'Priority scheduling'],
    color: 'bg-yellow-500'
  },
  {
    name: 'Platinum',
    threshold: 10000,
    perks: ['15% discount on services', 'Free vehicle inspections', 'Priority scheduling', 'Complimentary loaner vehicles'],
    color: 'bg-blue-600'
  }
];
