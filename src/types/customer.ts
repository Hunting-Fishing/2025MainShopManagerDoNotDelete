
// Main customer interface with all required fields
export interface Customer {
  id: string;
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
  shop_id: string; // Make required to match database
  created_at: string;
  updated_at: string;
  
  // Additional customer fields
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
  preferred_payment_method?: string;
  notes?: string;
  tags?: string[] | any;
  segments?: string[] | any;
  vehicles?: CustomerVehicle[];
  role?: string;
  
  // Business customer fields
  business_type?: string;
  business_industry?: string;
  other_business_industry?: string;
  tax_id?: string;
  business_email?: string;
  business_phone?: string;
  
  // Billing fields
  auto_billing?: boolean;
  credit_terms?: string;
  terms_agreed?: boolean;
  
  // Loyalty field
  loyalty?: CustomerLoyalty;
  
  // Computed fields
  full_name?: string;
  
  // Legacy compatibility
  name?: string;
  status?: string;
  dateAdded?: string;
  lastServiceDate?: string;
}

// Vehicle interface with make as optional to fix type errors
export interface CustomerVehicle {
  id?: string;
  customer_id?: string;
  year?: string | number;
  make?: string; // Make optional to fix current errors
  model?: string; // Make optional to match usage
  vin?: string;
  license_plate?: string;
  trim?: string;
  color?: string;
  last_service_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  
  // Additional vehicle fields
  transmission?: string;
  drive_type?: string;
  fuel_type?: string;
  engine?: string;
  body_style?: string;
  country?: string;
}

// Communication interface
export interface CustomerCommunication {
  id: string;
  customer_id: string;
  date: string;
  type: 'email' | 'phone' | 'text' | 'in-person';
  direction: 'incoming' | 'outgoing';
  subject?: string;
  content: string;
  staff_member_id: string;
  staff_member_name: string;
  status: 'completed' | 'pending' | 'failed';
  template_id?: string;
  template_name?: string;
}

// Note interface
export interface CustomerNote {
  id: string;
  customer_id: string;
  content: string;
  category: 'service' | 'sales' | 'follow-up' | 'general';
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Create type - shop_id is optional here since it will be set during creation
export type CustomerCreate = Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'shop_id'> & {
  shop_id?: string; // Make optional to fix service layer issues
  vehicles?: Partial<CustomerVehicle>[];
};

// Utility function
export const getCustomerFullName = (customer: Customer): string => {
  return `${customer.first_name} ${customer.last_name}`.trim();
};

// Adapter function
export const adaptCustomerForUI = (customer: Customer): Customer => {
  // Handle segments - ensure it's properly converted from JSON to array
  let segments = customer.segments;
  if (segments && typeof segments === 'string') {
    try {
      segments = JSON.parse(segments);
    } catch (e) {
      segments = [];
    }
  } else if (!segments) {
    segments = [];
  }
  
  // Handle tags - ensure it's properly converted from JSON to array
  let tags = customer.tags;
  if (tags && typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch (e) {
      tags = [];
    }
  } else if (tags && typeof tags !== 'object') {
    try {
      tags = JSON.parse(tags.toString());
    } catch (e) {
      tags = [];
    }
  } else if (!tags) {
    tags = [];
  }
  
  return {
    ...customer,
    segments: Array.isArray(segments) ? segments : [],
    tags: Array.isArray(tags) ? tags : [],
    status: customer.status || 'active',
    name: getCustomerFullName(customer),
    dateAdded: customer.created_at,
  };
};

// Import CustomerLoyalty from loyalty types
import { CustomerLoyalty } from './loyalty';
