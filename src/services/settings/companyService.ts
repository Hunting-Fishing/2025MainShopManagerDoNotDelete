
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
  updateCompanyInfo: companyInfoService.updateCompanyInfo,
  uploadLogo: companyInfoService.uploadLogo,
  
  // Business Hours Methods
  getBusinessHours: businessHoursService.getBusinessHours,
  updateBusinessHours: businessHoursService.updateBusinessHours,
  
  // Business Industry Methods
  addCustomIndustry: businessIndustryService.addCustomIndustry
};
