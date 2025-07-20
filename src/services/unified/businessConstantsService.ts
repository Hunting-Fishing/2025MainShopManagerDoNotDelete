import { supabase } from '@/integrations/supabase/client';

export interface BusinessConstant {
  value: string;
  label: string;
  description?: string;
  sortOrder?: number;
}

export interface BusinessConstantsResponse {
  businessTypes: BusinessConstant[];
  industries: BusinessConstant[];
  paymentMethods: BusinessConstant[];
}

class BusinessConstantsService {
  /**
   * Fetch business constants by category from the unified business_constants table
   */
  async getBusinessConstants(): Promise<BusinessConstantsResponse> {
    try {
      const { data, error } = await supabase
        .from('business_constants')
        .select('category, key, label, value, description, sort_order')
        .eq('is_active', true)
        .order('category')
        .order('sort_order');

      if (error) throw error;

      // Group constants by category
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push({
          value: item.value,
          label: item.label,
          description: item.description || undefined,
          sortOrder: item.sort_order || 0
        });
        return acc;
      }, {} as Record<string, BusinessConstant[]>);

      return {
        businessTypes: grouped.business_types || [],
        industries: grouped.industries || [],
        paymentMethods: grouped.payment_methods || []
      };
    } catch (error) {
      console.error('Error fetching business constants:', error);
      throw new Error('Failed to load business constants');
    }
  }

  /**
   * Get constants for a specific category
   */
  async getConstantsByCategory(category: string): Promise<BusinessConstant[]> {
    try {
      const { data, error } = await supabase
        .from('business_constants')
        .select('key, label, value, description, sort_order')
        .eq('category', category)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return data.map(item => ({
        value: item.value,
        label: item.label,
        description: item.description || undefined,
        sortOrder: item.sort_order || 0
      }));
    } catch (error) {
      console.error(`Error fetching ${category} constants:`, error);
      throw new Error(`Failed to load ${category} constants`);
    }
  }

  /**
   * Add a custom industry (for backward compatibility)
   */
  async addCustomIndustry(industryName: string): Promise<string> {
    try {
      const key = industryName.toLowerCase().replace(/\s+/g, '_');
      
      const { data, error } = await supabase
        .from('business_constants')
        .insert({
          category: 'industries',
          key,
          label: industryName,
          value: key,
          sort_order: 50 // Place custom industries in the middle
        })
        .select()
        .single();

      if (error) throw error;

      return data.value;
    } catch (error) {
      console.error('Error adding custom industry:', error);
      throw new Error('Failed to add custom industry');
    }
  }

  /**
   * Admin function to manage business constants
   */
  async upsertConstant(
    category: string,
    key: string,
    label: string,
    value?: string,
    options?: {
      description?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('business_constants')
        .upsert({
          category,
          key,
          label,
          value: value || key,
          description: options?.description,
          sort_order: options?.sortOrder || 0,
          is_active: options?.isActive ?? true
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error upserting business constant:', error);
      throw new Error('Failed to save business constant');
    }
  }
}

export const businessConstantsService = new BusinessConstantsService();