
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface CompanyInfo {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  tax_id?: string;
  business_type?: string;
  industry?: string;
  other_industry?: string;
}

export interface ShopData extends CompanyInfo {
  shop_id?: string;
  organization_id?: string;
  is_active?: boolean;
  onboarding_completed?: boolean;
  onboarding_data?: any;
  latitude?: number;
  longitude?: number;
  shop_description?: string;
  shop_image_url?: string;
}

export interface ShopValidation {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

// Define the exact structure that matches the shops table
interface ShopUpdateData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  tax_id?: string;
  business_type?: string;
  industry?: string;
  other_industry?: string;
  shop_description?: string;
  shop_image_url?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
  onboarding_completed?: boolean;
  onboarding_data?: any;
}

class ShopDataService {
  private readonly REQUIRED_FIELDS = ['name', 'email'];
  private readonly BUSINESS_FIELDS = ['phone', 'address', 'city', 'state'];

  /**
   * Get current shop data with validation
   */
  async getValidatedShopData(): Promise<{ data: ShopData | null; validation: ShopValidation }> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching shop data:', error);
        return {
          data: null,
          validation: {
            isValid: false,
            missingFields: this.REQUIRED_FIELDS,
            warnings: ['Failed to fetch shop data']
          }
        };
      }

      const validation = this.validateShopData(data);
      
      return {
        data: data as ShopData,
        validation
      };
    } catch (error) {
      console.error('Unexpected error in getValidatedShopData:', error);
      return {
        data: null,
        validation: {
          isValid: false,
          missingFields: this.REQUIRED_FIELDS,
          warnings: ['Unexpected error occurred']
        }
      };
    }
  }

  /**
   * Get company information in CompanyInfo format
   */
  async getCompanyInfo(): Promise<CompanyInfo | null> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          id,
          name,
          address,
          city,
          state,
          postal_code,
          phone,
          email,
          logo_url,
          tax_id,
          business_type,
          industry,
          other_industry
        `)
        .single();

      if (error) {
        console.error('Error fetching company info:', error);
        return null;
      }

      return data as CompanyInfo;
    } catch (error) {
      console.error('Unexpected error in getCompanyInfo:', error);
      return null;
    }
  }

  /**
   * Update company information
   */
  async updateCompanyInfo(updates: Partial<CompanyInfo>): Promise<boolean> {
    try {
      // Remove id from updates as it's not updatable
      const { id, ...updateData } = updates;
      
      // Map CompanyInfo to ShopUpdateData structure
      const shopUpdateData: ShopUpdateData = {
        name: updateData.name,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        postal_code: updateData.postal_code,
        phone: updateData.phone,
        email: updateData.email,
        logo_url: updateData.logo_url,
        tax_id: updateData.tax_id,
        business_type: updateData.business_type,
        industry: updateData.industry,
        other_industry: updateData.other_industry
      };

      // Remove undefined values
      const cleanUpdateData = Object.fromEntries(
        Object.entries(shopUpdateData).filter(([_, value]) => value !== undefined)
      );

      const { error } = await supabase
        .from('shops')
        .update(cleanUpdateData)
        .single();

      if (error) {
        console.error('Error updating company info:', error);
        return false;
      }

      // Log the update for audit trail
      await this.logShopDataChange('company_info_update', cleanUpdateData);
      
      return true;
    } catch (error) {
      console.error('Unexpected error in updateCompanyInfo:', error);
      return false;
    }
  }

  /**
   * Update shop data with proper validation
   */
  async updateShopData(updates: Partial<ShopData>): Promise<boolean> {
    try {
      // Remove fields that shouldn't be updated directly
      const { id, shop_id, organization_id, ...updateData } = updates;
      
      const { error } = await supabase
        .from('shops')
        .update(updateData)
        .single();

      if (error) {
        console.error('Error updating shop data:', error);
        return false;
      }

      // Log the update for audit trail
      await this.logShopDataChange('shop_data_update', updateData);
      
      return true;
    } catch (error) {
      console.error('Unexpected error in updateShopData:', error);
      return false;
    }
  }

  /**
   * Validate shop data completeness
   */
  validateShopData(data: any): ShopValidation {
    if (!data) {
      return {
        isValid: false,
        missingFields: this.REQUIRED_FIELDS,
        warnings: ['No shop data available']
      };
    }

    const missingFields: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    this.REQUIRED_FIELDS.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        missingFields.push(field);
      }
    });

    // Check business fields for warnings
    this.BUSINESS_FIELDS.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        warnings.push(`${field} is recommended for complete business profile`);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }

  /**
   * Log shop data changes for audit trail
   */
  private async logShopDataChange(action: string, data: any): Promise<void> {
    try {
      console.log(`Shop data change logged: ${action}`, data);
      // Here you could implement actual audit logging to a separate table
      // For now, we'll just log to console
    } catch (error) {
      console.error('Error logging shop data change:', error);
      // Don't throw error as this is just for logging
    }
  }

  /**
   * Get shop data health status
   */
  async getShopDataHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    score: number;
  }> {
    const { data, validation } = await this.getValidatedShopData();
    
    if (!data) {
      return {
        status: 'critical',
        issues: ['Shop data not found'],
        score: 0
      };
    }

    const totalFields = this.REQUIRED_FIELDS.length + this.BUSINESS_FIELDS.length;
    const filledFields = totalFields - validation.missingFields.length;
    const score = Math.round((filledFields / totalFields) * 100);

    let status: 'healthy' | 'warning' | 'critical';
    if (score >= 80) {
      status = 'healthy';
    } else if (score >= 60) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    const issues = [
      ...validation.missingFields.map(field => `Missing required field: ${field}`),
      ...validation.warnings
    ];

    return {
      status,
      issues,
      score
    };
  }
}

// Export singleton instance
export const shopDataService = new ShopDataService();
