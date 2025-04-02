
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
  notes?: string;
  tags?: string[];
  vehicles?: CustomerVehicle[];
  
  segments?: string[] | any; 
  
  loyalty?: CustomerLoyalty;
  
  company?: string;
  status?: string;
  lastServiceDate?: string;
  name?: string;
  dateAdded?: string;
  
  preferred_technician_history?: PreferredTechnicianChange[];
}

export interface PreferredTechnicianChange {
  id: string;
  customer_id: string;
  previous_technician_id?: string;
  previous_technician_name?: string;
  new_technician_id?: string;
  new_technician_name?: string;
  change_date: string;
  change_reason?: string;
  changed_by_id: string;
  changed_by_name: string;
}

export interface CustomerVehicle {
  id: string;
  year?: number;
  make?: string;
  model?: string;
  vin?: string;
  license_plate?: string;
  color?: string;
  last_service_date?: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  content: string;
  category: 'service' | 'sales' | 'follow-up' | 'general';
  created_by: string;
  created_at: string;
  updated_at: string;
}

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

export interface Household {
  id: string;
  name: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  members?: HouseholdMember[];
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  customer_id: string;
  relationship_type?: string;
  customer?: Customer;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  rule_count?: number;
  customer_count?: number;
}

export interface SegmentRule {
  id: string;
  segment_id: string;
  rule_type: string;
  rule_value: string;
  rule_operator: string;
  created_at: string;
  updated_at: string;
}

export type CustomerCreate = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

export const getCustomerFullName = (customer: Customer): string => {
  return `${customer.first_name} ${customer.last_name}`;
};

export const adaptCustomerForUI = (customer: Customer): Customer => {
  let segments = customer.segments;
  if (segments && typeof segments !== 'object') {
    try {
      segments = JSON.parse(segments);
    } catch (e) {
      segments = [];
    }
  } else if (!segments) {
    segments = [];
  }
  
  let tags = customer.tags;
  if (tags && typeof tags !== 'object') {
    try {
      tags = JSON.parse(tags);
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
    status: 'active',
    lastServiceDate: undefined,
    name: getCustomerFullName(customer),
    dateAdded: customer.created_at,
  };
};

export const createCustomerForUI = (
  dbCustomer: Customer,
  additionalProps?: {
    company?: string;
    notes?: string;
    lastServiceDate?: string;
    status?: string;
  }
): Customer => {
  return {
    ...dbCustomer,
    ...additionalProps,
    name: getCustomerFullName(dbCustomer),
    dateAdded: dbCustomer.created_at,
  };
};

import { CustomerLoyalty } from './loyalty';
