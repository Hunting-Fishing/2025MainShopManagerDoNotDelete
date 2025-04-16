
export interface CompanyInfo {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  businessType?: string;
  industry?: string;
  otherIndustry?: string;
  logoUrl?: string;
}

export interface BusinessHours {
  id?: string;
  shop_id?: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  [key: string]: any;
}
