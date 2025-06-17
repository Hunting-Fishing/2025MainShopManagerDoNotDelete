
import { CustomerVehicle } from './vehicle';
import { CustomerNote } from './notes';
import { CustomerHousehold } from './household';
import { CustomerSegment } from './segment';
import { CustomerLoyalty } from '../loyalty';

// Base customer interface matching database schema
export interface Customer {
  id: string;
  shop_id: string; // Required
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  company?: string;
  preferred_technician_id?: string;
  preferred_contact_method?: string;
  marketing_opt_in?: boolean;
  tags?: string[];
  notes?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  referral_source?: string;
  business_name?: string;
  business_type?: string;
  business_phone?: string;
  business_email?: string;
  business_industry?: string;
  fleet_size?: number;
  auto_billing?: boolean;
  is_commercial?: boolean;
  tax_exempt?: boolean;
  communication_preference?: string;
  language_preference?: string;
  referrer_id?: string;
  loyalty_tier?: string;
  household_id?: string;
  household_relationship?: string;
  auth_user_id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Additional fields used in forms
  other_business_industry?: string;
  tax_id?: string;
  preferred_payment_method?: string;
  credit_terms?: string;
  terms_agreed?: boolean;
  referral_person_id?: string;
  other_referral_details?: string;
  is_fleet?: boolean;
  fleet_company?: string;
  fleet_manager?: string;
  fleet_contact?: string;
  preferred_service_type?: string;
  
  // Related data
  vehicles?: CustomerVehicle[];
  notes_list?: CustomerNote[];
  household?: CustomerHousehold;
  segments?: CustomerSegment[];
  loyalty?: CustomerLoyalty;
}

// Customer creation interface - shop_id is required but some other fields are optional
export interface CustomerCreate {
  shop_id: string; // Required
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  company?: string;
  preferred_technician_id?: string;
  preferred_contact_method?: string;
  marketing_opt_in?: boolean;
  tags?: string[];
  notes?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  referral_source?: string;
  business_name?: string;
  business_type?: string;
  business_phone?: string;
  business_email?: string;
  business_industry?: string;
  fleet_size?: number;
  auto_billing?: boolean;
  is_commercial?: boolean;
  tax_exempt?: boolean;
  communication_preference?: string;
  language_preference?: string;
  referrer_id?: string;
  loyalty_tier?: string;
  household_id?: string;
  household_relationship?: string;
  auth_user_id?: string;
  
  // Additional fields used in forms
  other_business_industry?: string;
  tax_id?: string;
  preferred_payment_method?: string;
  credit_terms?: string;
  terms_agreed?: boolean;
  referral_person_id?: string;
  other_referral_details?: string;
  is_fleet?: boolean;
  fleet_company?: string;
  fleet_manager?: string;
  fleet_contact?: string;
  preferred_service_type?: string;
  
  // Related data
  vehicles?: Partial<CustomerVehicle>[];
}

// Customer update interface - all fields optional except id
export interface CustomerUpdate {
  id: string;
  shop_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  company?: string;
  preferred_technician_id?: string;
  preferred_contact_method?: string;
  marketing_opt_in?: boolean;
  tags?: string[];
  notes?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  referral_source?: string;
  business_name?: string;
  business_type?: string;
  business_phone?: string;
  business_email?: string;
  business_industry?: string;
  fleet_size?: number;
  auto_billing?: boolean;
  is_commercial?: boolean;
  tax_exempt?: boolean;
  communication_preference?: string;
  language_preference?: string;
  referrer_id?: string;
  loyalty_tier?: string;
  household_id?: string;
  household_relationship?: string;
  auth_user_id?: string;
  
  // Additional fields used in forms
  other_business_industry?: string;
  tax_id?: string;
  preferred_payment_method?: string;
  credit_terms?: string;
  terms_agreed?: boolean;
  referral_person_id?: string;
  other_referral_details?: string;
  is_fleet?: boolean;
  fleet_company?: string;
  fleet_manager?: string;
  fleet_contact?: string;
  preferred_service_type?: string;
}
