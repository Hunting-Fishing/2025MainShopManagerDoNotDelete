
export interface Bay {
  id: string;
  bay_name: string;
  bay_location: string | null;
  hourly_rate: number;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  is_active: boolean;
  shop_id: string;
  created_at: string;
  updated_at: string;
  display_order: number;
  // Legacy fields for backward compatibility
  name?: string;  
  description?: string | null;
  bay_number?: number;
  bay_type?: string;
  features?: string[] | null;
}

export interface RateSettings {
  id?: string;
  daily_hours: number;
  daily_discount_percent: number;
  weekly_multiplier: number;
  monthly_multiplier: number;
  hourly_base_rate: number;
}

// Adding the RateHistory interface that's being used
export interface RateHistory {
  id: string;
  bay_id: string;
  hourly_rate: number;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  changed_by?: string;
  changed_at: string;
  created_at: string;
  user_email?: string;
}

// Adding the missing functions that are being imported
export const createBay = async (bayData: Partial<Bay>, shopId: string): Promise<Bay> => {
  // This is a stub - you'll need to implement the actual API call
  console.log('Creating bay with data:', bayData, 'for shop:', shopId);
  
  // Return a mock bay for now
  return {
    id: Math.random().toString(),
    bay_name: bayData.bay_name || '',
    bay_location: bayData.bay_location || null,
    hourly_rate: bayData.hourly_rate || 0,
    daily_rate: bayData.daily_rate || null,
    weekly_rate: bayData.weekly_rate || null,
    monthly_rate: bayData.monthly_rate || null,
    is_active: bayData.is_active || true,
    shop_id: shopId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    display_order: bayData.display_order || 0
  };
};

export const updateBay = async (bay: Bay): Promise<void> => {
  // This is a stub - you'll need to implement the actual API call
  console.log('Updating bay:', bay);
  // In a real implementation this would update the bay in the database
};

export const deleteBay = async (bayId: string): Promise<void> => {
  // This is a stub - you'll need to implement the actual API call
  console.log('Deleting bay with ID:', bayId);
  // In a real implementation this would delete the bay from the database
};

export const calculateRates = (hourlyRate: number, settings: RateSettings): { daily: number; weekly: number; monthly: number } => {
  // Calculate daily rate (hourly rate * daily hours - discount)
  const dailyHours = settings.daily_hours;
  const discountPercent = settings.daily_discount_percent;
  
  const baseDaily = hourlyRate * dailyHours;
  const discount = baseDaily * (discountPercent / 100);
  const daily = baseDaily - discount;
  
  // Calculate weekly and monthly rates using multipliers
  const weeklyMultiplier = settings.weekly_multiplier;
  const monthlyMultiplier = settings.monthly_multiplier;
  
  const weekly = hourlyRate * weeklyMultiplier;
  const monthly = hourlyRate * monthlyMultiplier;
  
  return {
    daily,
    weekly,
    monthly
  };
};

export const fetchRateHistory = async (bayId: string): Promise<RateHistory[]> => {
  // This is a stub - you'll need to implement the actual API call
  console.log('Fetching rate history for bay ID:', bayId);
  
  // Return empty array for now
  return [];
};
