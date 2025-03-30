// Define the customer interface based on Supabase table structure
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  shop_id: string;
  created_at: string;
  updated_at: string;
  
  // Added fields for enhanced customer management
  preferred_technician_id?: string;
  referral_source?: string;
  referral_person_id?: string;
  household_id?: string;
  is_fleet?: boolean;
  fleet_company?: string;
  notes?: string;
  tags?: string[];
  vehicles?: CustomerVehicle[];
  
  // New fields for Phase 3 - updated to handle JSON data from Supabase
  segments?: string[] | any; // This allows for both string[] and JSON from database
  
  // New fields for Phase 4 - Loyalty
  loyalty?: CustomerLoyalty;
  
  // We'll add these fields for compatibility with existing components
  // They will be undefined on direct database objects, but we'll use getters
  company?: string;
  status?: string;
  lastServiceDate?: string;
  name?: string;
  dateAdded?: string;
  
  // New fields for Phase 2
  communications?: CustomerCommunication[];
  noteEntries?: CustomerNote[];
}

// Define vehicle information
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

// Define customer note entry
export interface CustomerNote {
  id: string;
  customer_id: string;
  date: string;
  category: 'service' | 'sales' | 'follow-up' | 'general';
  content: string;
  created_by: string;
  created_at: string;
}

// Define customer communication
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

// Define household type
export interface Household {
  id: string;
  name: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  members?: HouseholdMember[];
}

// Define household member type
export interface HouseholdMember {
  id: string;
  household_id: string;
  customer_id: string;
  relationship_type?: string;
  customer?: Customer;
}

// Define segment type
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

// Define segment rule type
export interface SegmentRule {
  id: string;
  segment_id: string;
  rule_type: string;
  rule_value: string;
  rule_operator: string;
  created_at: string;
  updated_at: string;
}

// Helper type for creating a new customer
export type CustomerCreate = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

// Helper function to format customer display name
export const getCustomerFullName = (customer: Customer): string => {
  return `${customer.first_name} ${customer.last_name}`;
};

// Helper function to adapt database customer objects to the format expected by UI components
export const adaptCustomerForUI = (customer: Customer): Customer => {
  // Convert segments from JSON to string array if needed
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
  
  return {
    ...customer,
    // Ensure segments is a proper array
    segments: Array.isArray(segments) ? segments : [],
    // Add UI-expected fields (these will be used by the components)
    status: 'active', // Default status since we don't have this in the database yet
    lastServiceDate: undefined, // This would need to come from work orders in a real implementation
    name: getCustomerFullName(customer),
    dateAdded: customer.created_at,
  };
};

// Helper function to create a UI-compatible customer object
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
