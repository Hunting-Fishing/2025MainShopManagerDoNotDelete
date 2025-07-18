import { supabase } from "@/integrations/supabase/client";

export interface TaxSettings {
  labor_tax_rate: number;
  parts_tax_rate: number;
  tax_calculation_method: 'separate' | 'compound';
  tax_display_method: 'inclusive' | 'exclusive';
  apply_tax_to_labor: boolean;
  apply_tax_to_parts: boolean;
  tax_description: string;
  tax_exempt_customers: string[];
}

async function getTaxSettings(shopId: string): Promise<TaxSettings> {
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('settings_value')
      .eq('shop_id', shopId)
      .eq('settings_key', 'tax_settings')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching tax settings:', error);
      throw error;
    }
    
    // Return default settings if none exist
    if (!data) {
      return {
        labor_tax_rate: 0.0,
        parts_tax_rate: 0.0,
        tax_calculation_method: 'separate',
        tax_display_method: 'exclusive',
        apply_tax_to_labor: true,
        apply_tax_to_parts: true,
        tax_description: 'Tax',
        tax_exempt_customers: []
      };
    }
    
    return data.settings_value as unknown as TaxSettings;
  } catch (error) {
    console.error('Failed to get tax settings:', error);
    throw error;
  }
}

async function updateTaxSettings(shopId: string, taxSettings: TaxSettings): Promise<TaxSettings> {
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .upsert({
        shop_id: shopId,
        settings_key: 'tax_settings',
        settings_value: taxSettings as any,
        updated_at: new Date().toISOString()
      })
      .select('settings_value')
      .single();
    
    if (error) {
      console.error('Error updating tax settings:', error);
      throw error;
    }
    
    return data.settings_value as unknown as TaxSettings;
  } catch (error) {
    console.error('Failed to update tax settings:', error);
    throw error;
  }
}

export const taxSettingsService = {
  getTaxSettings,
  updateTaxSettings
};