import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface PowerWashingSettingsData {
  // General
  business_name?: string;
  business_phone?: string;
  license_number?: string;
  service_types?: {
    house_washing: boolean;
    driveway_cleaning: boolean;
    deck_patio: boolean;
    roof_cleaning: boolean;
    gutter_cleaning: boolean;
  };
  
  // Service Areas
  primary_zip_codes?: string;
  service_radius?: number;
  travel_fee?: number;
  zone_based_pricing?: boolean;
  
  // Scheduling
  default_duration?: string;
  minimum_lead_time?: number;
  default_start_time?: string;
  default_end_time?: string;
  weather_based_scheduling?: boolean;
  weekend_jobs?: boolean;
  
  // Billing
  labor_rate?: number;
  tax_rate?: number;
  minimum_charge?: number;
  environmental_fee?: number;
  auto_generate_invoices?: boolean;
  water_hookup_credit?: boolean;
  
  // Chemicals
  default_bleach_ratio?: number;
  default_surfactant_ratio?: number;
  low_stock_threshold?: number;
  require_sds?: boolean;
  track_chemical_usage?: boolean;
  
  // Notifications
  appointment_reminders?: boolean;
  on_my_way_notifications?: boolean;
  job_complete_notifications?: boolean;
  new_quote_alerts?: boolean;
  weather_warnings?: boolean;
  low_chemical_alerts?: boolean;
}

interface SettingsRow {
  id: string;
  shop_id: string;
  settings: Json;
  created_at: string;
  updated_at: string;
}

const defaultSettings: PowerWashingSettingsData = {
  // General
  business_name: '',
  business_phone: '',
  license_number: '',
  service_types: {
    house_washing: true,
    driveway_cleaning: true,
    deck_patio: true,
    roof_cleaning: true,
    gutter_cleaning: false,
  },
  
  // Service Areas
  primary_zip_codes: '',
  service_radius: 25,
  travel_fee: 2.50,
  zone_based_pricing: false,
  
  // Scheduling
  default_duration: '2',
  minimum_lead_time: 24,
  default_start_time: '08:00',
  default_end_time: '17:00',
  weather_based_scheduling: true,
  weekend_jobs: true,
  
  // Billing
  labor_rate: 75,
  tax_rate: 8.25,
  minimum_charge: 150,
  environmental_fee: 25,
  auto_generate_invoices: true,
  water_hookup_credit: false,
  
  // Chemicals
  default_bleach_ratio: 3,
  default_surfactant_ratio: 2,
  low_stock_threshold: 20,
  require_sds: true,
  track_chemical_usage: true,
  
  // Notifications
  appointment_reminders: true,
  on_my_way_notifications: true,
  job_complete_notifications: true,
  new_quote_alerts: true,
  weather_warnings: true,
  low_chemical_alerts: true,
};

export function usePowerWashingSettings() {
  const { shopId } = useShopId();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['power-washing-settings', shopId],
    queryFn: async () => {
      if (!shopId) return defaultSettings;
      
      const { data, error } = await supabase
        .from('power_washing_settings')
        .select('*')
        .eq('shop_id', shopId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching power washing settings:', error);
        throw error;
      }
      
      if (!data) {
        return defaultSettings;
      }
      
      // Merge with defaults to ensure all fields exist
      const storedSettings = (data as SettingsRow).settings as PowerWashingSettingsData;
      return { ...defaultSettings, ...storedSettings };
    },
    enabled: !!shopId,
  });

  const saveMutation = useMutation({
    mutationFn: async (newSettings: PowerWashingSettingsData) => {
      if (!shopId) throw new Error('No shop ID');
      
      // Check if settings exist
      const { data: existing } = await supabase
        .from('power_washing_settings')
        .select('id')
        .eq('shop_id', shopId)
        .maybeSingle();
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('power_washing_settings')
          .update({ 
            settings: newSettings as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq('shop_id', shopId);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('power_washing_settings')
          .insert({ 
            shop_id: shopId,
            settings: newSettings as unknown as Json 
          });
        
        if (error) throw error;
      }
      
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['power-washing-settings', shopId] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    },
  });

  return {
    settings: settings || defaultSettings,
    isLoading,
    error,
    saveSettings: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}
