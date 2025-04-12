
import { companyInfoService } from "./companyInfoService";
import { businessHoursService } from "./businessHoursService";
import { businessIndustryService } from "./businessIndustryService";

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
  otherIndustry?: string;  
  logoUrl: string;
}

export interface BusinessHours {
  id?: string;
  shop_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export const companyService = {
  // Company Info Methods
  getShopInfo: companyInfoService.getShopInfo,
  updateCompanyInfo: async (shopId: string, companyInfo: CompanyInfo, businessHours: BusinessHours[]) => {
    await companyInfoService.updateCompanyInfo(shopId, companyInfo, businessHours);
    await businessHoursService.updateBusinessHours(shopId, businessHours);
    return { success: true };
  },
  uploadLogo: companyInfoService.uploadLogo,
  
  // Business Hours Methods
  getBusinessHours: businessHoursService.getBusinessHours,
  
  // Business Industry Methods
  addCustomIndustry: businessIndustryService.addCustomIndustry
};
