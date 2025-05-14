
import { supabase } from "@/integrations/supabase/client";

export interface Bay {
  id: string;
  bay_name: string;
  bay_location: string;
  hourly_rate: number;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  is_active: boolean;
}

export interface RateSettings {
  id: string;
  daily_hours: number;
  daily_discount_percent: number;
  weekly_multiplier: number;
  monthly_multiplier: number;
}

export interface RateHistory {
  id: string;
  bay_id: string;
  hourly_rate: number;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  changed_at: string;
  changed_by?: string;
  user_email?: string;  // Make this optional since it might not exist in the raw data
}

/**
 * Fetches all DIY bays for a shop
 */
export async function fetchBays(shopId: string): Promise<Bay[]> {
  console.log("Fetching bays for shop:", shopId);
  const { data, error } = await supabase
    .from('diy_bay_rates')
    .select('*')
    .eq('shop_id', shopId)
    .order('bay_name');
  
  if (error) {
    console.error("Error fetching bays:", error);
    throw error;
  }
  
  console.log("Fetched bays:", data);
  return data || [];
}

/**
 * Fetches rate calculation settings for a shop
 */
export async function fetchRateSettings(shopId: string): Promise<RateSettings | null> {
  console.log("Fetching rate settings for shop:", shopId);
  const { data, error } = await supabase
    .from('diy_bay_rate_settings')
    .select('*')
    .eq('shop_id', shopId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error("Error fetching rate settings:", error);
    throw error;
  }
  
  console.log("Fetched rate settings:", data);
  return data || null;
}

/**
 * Creates a new DIY bay
 */
export async function createBay(bay: Omit<Bay, 'id'>, shopId: string): Promise<Bay> {
  const { data, error } = await supabase
    .from('diy_bay_rates')
    .insert([{ ...bay, shop_id: shopId }])
    .select();
  
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('No data returned after creating bay');
  }
  
  return data[0] as Bay;
}

/**
 * Updates an existing DIY bay
 */
export async function updateBay(bay: Bay): Promise<void> {
  const { error } = await supabase
    .from('diy_bay_rates')
    .update({
      bay_name: bay.bay_name,
      bay_location: bay.bay_location,
      hourly_rate: bay.hourly_rate,
      daily_rate: bay.daily_rate,
      weekly_rate: bay.weekly_rate,
      monthly_rate: bay.monthly_rate,
      is_active: bay.is_active
    })
    .eq('id', bay.id);
  
  if (error) {
    console.error("Error updating bay:", error);
    throw error;
  }
}

/**
 * Deletes a DIY bay
 */
export async function deleteBay(bayId: string): Promise<void> {
  const { error } = await supabase
    .from('diy_bay_rates')
    .delete()
    .eq('id', bayId);
  
  if (error) throw error;
}

/**
 * Fetches rate change history for a bay
 */
export async function fetchRateHistory(bayId: string): Promise<RateHistory[]> {
  console.log("Fetching rate history for bay:", bayId);
  const { data, error } = await supabase
    .from('diy_bay_rate_history')
    .select('*')
    .eq('bay_id', bayId)
    .order('changed_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching rate history:", error);
    throw error;
  }
  
  console.log("Fetched rate history:", data);
  
  // Transform the data to include user email if available
  return data.map(entry => ({
    ...entry,
    user_email: entry.changed_by ? entry.changed_by : 'System' // Use changed_by or default to 'System'
  })) as RateHistory[];
}

/**
 * Saves rate calculation settings
 */
export async function saveRateSettings(settings: Omit<RateSettings, 'id'>, shopId: string, existingId?: string): Promise<RateSettings> {
  if (existingId) {
    // Update existing settings
    const { data, error } = await supabase
      .from('diy_bay_rate_settings')
      .update({
        daily_hours: settings.daily_hours,
        daily_discount_percent: settings.daily_discount_percent,
        weekly_multiplier: settings.weekly_multiplier,
        monthly_multiplier: settings.monthly_multiplier
      })
      .eq('id', existingId)
      .select();
      
    if (error) throw error;
    return data?.[0] as RateSettings;
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from('diy_bay_rate_settings')
      .insert({
        shop_id: shopId,
        daily_hours: settings.daily_hours,
        daily_discount_percent: settings.daily_discount_percent,
        weekly_multiplier: settings.weekly_multiplier,
        monthly_multiplier: settings.monthly_multiplier
      })
      .select();
      
    if (error) throw error;
    return data?.[0] as RateSettings;
  }
}

/**
 * Calculate rates based on settings
 */
export function calculateRates(hourlyRate: number, settings: RateSettings) {
  const dailyRate = hourlyRate * settings.daily_hours;
  const discount = dailyRate * (settings.daily_discount_percent / 100);
  
  return {
    hourly: hourlyRate,
    daily: parseFloat((dailyRate - discount).toFixed(2)),
    weekly: parseFloat((hourlyRate * settings.weekly_multiplier).toFixed(2)),
    monthly: parseFloat((hourlyRate * settings.monthly_multiplier).toFixed(2))
  };
}

/**
 * Update bay rates based on new settings
 */
export async function updateAllBayRates(bays: Bay[], settings: RateSettings): Promise<Bay[]> {
  const updatedBays = bays.map(bay => {
    const rates = calculateRates(bay.hourly_rate, settings);
    return {
      ...bay,
      daily_rate: rates.daily,
      weekly_rate: rates.weekly,
      monthly_rate: rates.monthly
    };
  });
  
  // Update all bays in database
  for (const bay of updatedBays) {
    await supabase
      .from('diy_bay_rates')
      .update({
        daily_rate: bay.daily_rate,
        weekly_rate: bay.weekly_rate,
        monthly_rate: bay.monthly_rate
      })
      .eq('id', bay.id);
  }
  
  return updatedBays;
}
