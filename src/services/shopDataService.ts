
import { supabase } from '@/lib/supabase';

/**
 * Unified Shop Data Service
 * Centralized management of all shop-related data operations
 */

export interface ShopData {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  business_type?: string;
  industry?: string;
  other_industry?: string;
  tax_id?: string;
  is_active: boolean;
  onboarding_completed: boolean;
  setup_step: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  taxId: string;
  businessType: string;
  industry: string;
  otherIndustry: string;
  logoUrl: string;
}

export interface ShopUpdateData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  business_type?: string;
  industry?: string;
  other_industry?: string;
  tax_id?: string;
}

class ShopDataService {
  /**
   * Get current shop data
   */
  async getShopData(): Promise<ShopData | null> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching shop data:', error);
        throw error;
      }

      console.log('Shop data fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to get shop data:', error);
      return null;
    }
  }

  /**
   * Update shop data
   */
  async updateShopData(shopId: string, updates: ShopUpdateData): Promise<ShopData | null> {
    try {
      console.log('Updating shop data:', { shopId, updates });

      const { data, error } = await supabase
        .from('shops')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', shopId)
        .select()
        .single();

      if (error) {
        console.error('Error updating shop data:', error);
        throw error;
      }

      console.log('Shop data updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to update shop data:', error);
      throw error;
    }
  }

  /**
   * Get formatted company info for display
   */
  async getCompanyInfo(): Promise<CompanyInfo> {
    const shopData = await this.getShopData();
    
    if (!shopData) {
      return {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
        taxId: '',
        businessType: '',
        industry: '',
        otherIndustry: '',
        logoUrl: ''
      };
    }

    return {
      name: shopData.name || '',
      address: shopData.address || '',
      city: shopData.city || '',
      state: shopData.state || '',
      zip: shopData.postal_code || '',
      phone: shopData.phone || '',
      email: shopData.email || '',
      taxId: shopData.tax_id || '',
      businessType: shopData.business_type || '',
      industry: shopData.industry || '',
      otherIndustry: shopData.other_industry || '',
      logoUrl: shopData.logo_url || ''
    };
  }

  /**
   * Update company info
   */
  async updateCompanyInfo(companyInfo: Partial<CompanyInfo>): Promise<boolean> {
    try {
      const shopData = await this.getShopData();
      if (!shopData) {
        throw new Error('No shop data found');
      }

      const updates: ShopUpdateData = {
        name: companyInfo.name,
        address: companyInfo.address,
        city: companyInfo.city,
        state: companyInfo.state,
        postal_code: companyInfo.zip,
        phone: companyInfo.phone,
        email: companyInfo.email,
        tax_id: companyInfo.taxId,
        business_type: companyInfo.businessType,
        industry: companyInfo.industry,
        other_industry: companyInfo.otherIndustry,
        logo_url: companyInfo.logoUrl
      };

      // Remove undefined values
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof ShopUpdateData] === undefined) {
          delete updates[key as keyof ShopUpdateData];
        }
      });

      const result = await this.updateShopData(shopData.id, updates);
      return result !== null;
    } catch (error) {
      console.error('Failed to update company info:', error);
      return false;
    }
  }

  /**
   * Complete onboarding step
   */
  async completeOnboardingStep(step: number): Promise<boolean> {
    try {
      const shopData = await this.getShopData();
      if (!shopData) {
        throw new Error('No shop data found');
      }

      const updates: ShopUpdateData = {
        setup_step: Math.max(step, shopData.setup_step),
        ...(step >= 5 && { onboarding_completed: true })
      };

      const result = await this.updateShopData(shopData.id, updates);
      return result !== null;
    } catch (error) {
      console.error('Failed to complete onboarding step:', error);
      return false;
    }
  }

  /**
   * Validate shop data completeness
   */
  validateShopData(shopData: ShopData): { isValid: boolean; missingFields: string[] } {
    const requiredFields = ['name', 'email', 'phone'];
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      if (!shopData[field as keyof ShopData]) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Get shop data with validation
   */
  async getValidatedShopData(): Promise<{ data: ShopData | null; validation: { isValid: boolean; missingFields: string[] } }> {
    const data = await this.getShopData();
    
    if (!data) {
      return {
        data: null,
        validation: { isValid: false, missingFields: ['all'] }
      };
    }

    const validation = this.validateShopData(data);
    
    return { data, validation };
  }
}

// Export singleton instance
export const shopDataService = new ShopDataService();

// Export individual methods for backward compatibility
export const getShopData = () => shopDataService.getShopData();
export const updateShopData = (shopId: string, updates: ShopUpdateData) => 
  shopDataService.updateShopData(shopId, updates);
export const getCompanyInfo = () => shopDataService.getCompanyInfo();
export const updateCompanyInfo = (companyInfo: Partial<CompanyInfo>) => 
  shopDataService.updateCompanyInfo(companyInfo);
