export interface CustomerLoyalty {
  id: string;
  customer_id: string;
  current_points: number;
  lifetime_points: number;
  lifetime_value: number;
  tier?: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  threshold: number;
  multiplier: number;
  color?: string;
  benefits?: string;
  shop_id: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description?: string;
  points_cost: number;
  reward_value?: number;
  reward_type: string;
  is_active: boolean;
  shop_id?: string;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  points: number;
  transaction_type: string;
  description?: string;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

export interface LoyaltyRedemption {
  id: string;
  customer_id: string;
  reward_id: string;
  points_used: number;
  status: string;
  created_at: string;
  updated_at: string;
  used_at?: string;
  notes?: string;
}

export interface LoyaltySettings {
  id: string;
  shop_id: string;
  is_enabled: boolean;
  points_per_dollar: number;
  points_expiration_days: number;
  created_at?: string;
  updated_at?: string;
}

export interface FeedbackAnalytics {
  total_responses: number;
  average_rating: number;
  nps_score: number;
  promoters: number;
  passives: number;
  detractors: number;
}
