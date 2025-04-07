
// Household-related types
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

// Need to import Customer type
import { Customer } from './base';
