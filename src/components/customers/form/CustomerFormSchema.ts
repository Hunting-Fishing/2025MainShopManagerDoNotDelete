
import { z } from "zod";

// Import the Customer type from the existing type definition
export type { Customer, CustomerCreate } from '@/types/customer';
export type { VehicleFormData } from './schemas/vehicleSchema';

// Use the existing Customer interface as our form values
export type CustomerFormValues = Omit<Customer, 'id' | 'created_at' | 'updated_at'> & {
  vehicles?: VehicleFormData[];
  create_new_household?: boolean;
  new_household_name?: string;
  household_relationship?: string;
};

// Predefined segments for the selector
export const predefinedSegments = [
  'High Value',
  'Frequent Customer',
  'Fleet Owner',
  'New Customer',
  'VIP',
  'Commercial',
  'Retail'
];

// Relationship types
export const relationshipTypes = [
  { id: 'primary', label: 'Primary' },
  { id: 'spouse', label: 'Spouse' },
  { id: 'child', label: 'Child' },
  { id: 'parent', label: 'Parent' },
  { id: 'sibling', label: 'Sibling' },
  { id: 'other', label: 'Other' }
];

// Define the form schema using the Customer interface structure
export const customerSchema = z.object({
  // Personal Info - required fields
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  
  // Address
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  postal_code: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  
  // Business Info
  company: z.string().optional().or(z.literal("")),
  business_type: z.string().optional().or(z.literal("")),
  business_industry: z.string().optional().or(z.literal("")),
  other_business_industry: z.string().optional().or(z.literal("")),
  tax_id: z.string().optional().or(z.literal("")),
  business_email: z.string().email().optional().or(z.literal("")),
  business_phone: z.string().optional().or(z.literal("")),
  
  // Payment & Billing
  preferred_payment_method: z.string().optional().or(z.literal("")),
  auto_billing: z.boolean().optional().default(false),
  credit_terms: z.string().optional().or(z.literal("")),
  terms_agreed: z.boolean().optional().default(false),
  
  // Fleet Management
  is_fleet: z.boolean().optional().default(false),
  fleet_company: z.string().optional().or(z.literal("")),
  fleet_manager: z.string().optional().or(z.literal("")),
  fleet_contact: z.string().optional().or(z.literal("")),
  preferred_service_type: z.string().optional().or(z.literal("")),
  
  // Notes
  notes: z.string().optional().or(z.literal("")),
  
  // Shop assignment - required
  shop_id: z.string().min(1, "Shop selection is required"),
  
  // Preferences
  preferred_technician_id: z.string().optional().or(z.literal("")),
  communication_preference: z.string().optional().or(z.literal("")),
  
  // Referral
  referral_source: z.string().optional().or(z.literal("")),
  referral_person_id: z.string().optional().or(z.literal("")),
  other_referral_details: z.string().optional().or(z.literal("")),
  
  // Household
  household_id: z.string().optional().or(z.literal("")),
  create_new_household: z.boolean().default(false),
  new_household_name: z.string().optional().or(z.literal("")),
  household_relationship: z.string().optional().or(z.literal("")),
  
  // Arrays
  vehicles: z.array(z.any()).default([]),
  tags: z.array(z.string()).default([]),
  segments: z.array(z.string()).default([])
});
