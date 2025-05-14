export interface Bay {
  id: string;
  name: string;
  description: string | null;
  hourly_rate: number;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  is_active: boolean;
  bay_number: number;
  bay_type: string;
  features: string[] | null;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

export interface RateSettings {
  daily_hours: number;
  daily_discount_percent: number;
  weekly_multiplier: number;
  monthly_multiplier: number;
  hourly_base_rate?: number | string; // Added hourly_base_rate field
}
