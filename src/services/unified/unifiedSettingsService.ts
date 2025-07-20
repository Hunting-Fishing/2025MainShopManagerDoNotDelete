import { supabase } from '@/integrations/supabase/client';

export interface UnifiedSetting {
  category: string;
  key: string;
  value: any;
  validationRules?: Record<string, any>;
  isEncrypted?: boolean;
}

class UnifiedSettingsService {
  /**
   * Get a specific setting value
   */
  async getSetting<T = any>(
    shopId: string,
    category: string,
    key: string,
    defaultValue?: T
  ): Promise<T> {
    try {
      const { data, error } = await supabase
        .rpc('get_unified_setting', {
          p_shop_id: shopId,
          p_category: category,
          p_key: key
        });

      if (error) throw error;

      // Handle null/undefined values
      if (data === null || data === 'null') {
        return defaultValue as T;
      }

      return data as T;
    } catch (error) {
      console.error(`Error getting setting ${category}.${key}:`, error);
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Failed to get setting ${category}.${key}`);
    }
  }

  /**
   * Set a setting value
   */
  async setSetting(
    shopId: string,
    category: string,
    key: string,
    value: any,
    validationRules?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('set_unified_setting', {
          p_shop_id: shopId,
          p_category: category,
          p_key: key,
          p_value: JSON.stringify(value),
          p_validation_rules: validationRules ? JSON.stringify(validationRules) : '{}'
        });

      if (error) throw error;
    } catch (error) {
      console.error(`Error setting ${category}.${key}:`, error);
      throw new Error(`Failed to save setting ${category}.${key}`);
    }
  }

  /**
   * Get all settings for a category
   */
  async getSettingsByCategory(
    shopId: string,
    category: string
  ): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from('unified_settings')
        .select('key, value')
        .eq('shop_id', shopId)
        .eq('category', category);

      if (error) throw error;

      return data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error(`Error getting settings for category ${category}:`, error);
      throw new Error(`Failed to get settings for category ${category}`);
    }
  }

  /**
   * Set multiple settings for a category
   */
  async setSettingsForCategory(
    shopId: string,
    category: string,
    settings: Record<string, any>
  ): Promise<void> {
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        shop_id: shopId,
        category,
        key,
        value: JSON.stringify(value),
        created_by: (supabase.auth.getUser() as any)?.data?.user?.id,
        updated_by: (supabase.auth.getUser() as any)?.data?.user?.id
      }));

      const { error } = await supabase
        .from('unified_settings')
        .upsert(updates, {
          onConflict: 'shop_id,category,key'
        });

      if (error) throw error;
    } catch (error) {
      console.error(`Error setting settings for category ${category}:`, error);
      throw new Error(`Failed to save settings for category ${category}`);
    }
  }

  /**
   * Delete a setting
   */
  async deleteSetting(
    shopId: string,
    category: string,
    key: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('unified_settings')
        .delete()
        .eq('shop_id', shopId)
        .eq('category', category)
        .eq('key', key);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting setting ${category}.${key}:`, error);
      throw new Error(`Failed to delete setting ${category}.${key}`);
    }
  }

  /**
   * Get all settings for a shop
   */
  async getAllSettings(shopId: string): Promise<Record<string, Record<string, any>>> {
    try {
      const { data, error } = await supabase
        .from('unified_settings')
        .select('category, key, value')
        .eq('shop_id', shopId);

      if (error) throw error;

      return data.reduce((acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = {};
        }
        acc[setting.category][setting.key] = setting.value;
        return acc;
      }, {} as Record<string, Record<string, any>>);
    } catch (error) {
      console.error('Error getting all settings:', error);
      throw new Error('Failed to get shop settings');
    }
  }
}

export const unifiedSettingsService = new UnifiedSettingsService();