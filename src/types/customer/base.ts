
// Base customer interface with primary fields
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  shop_id: string;
  created_at: string;
  updated_at: string;
  
  preferred_technician_id?: string;
  communication_preference?: string;
  referral_source?: string;
  referral_person_id?: string;
  other_referral_details?: string;
  household_id?: string;
  is_fleet?: boolean;
  fleet_company?: string;
  fleet_manager?: string;
  fleet_contact?: string;
  preferred_service_type?: string;
  notes?: string;
  tags?: string[] | any; // Allow any type that will be normalized in adaptCustomerForUI
  
  segments?: string[] | any; // Allow any type that will be normalized in adaptCustomerForUI
  
  loyalty?: CustomerLoyalty;
  
  company?: string;
  status?: string;
  lastServiceDate?: string;
  name?: string;
  dateAdded?: string;
  
  preferred_technician_history?: PreferredTechnicianChange[];
  
  vehicles?: CustomerVehicle[];
  
  // Business info fields
  business_type?: string;
  business_industry?: string;
  other_business_industry?: string;
  tax_id?: string;
  business_email?: string;
  business_phone?: string;
  
  // Payment & Billing fields
  preferred_payment_method?: string;
  auto_billing?: boolean;
  credit_terms?: string;
  terms_agreed?: boolean;
  
  // Role field for distinguishing customers from employees/staff
  role?: string;
}

// Import CustomerLoyalty from loyalty.ts
import { CustomerLoyalty } from '../loyalty';
