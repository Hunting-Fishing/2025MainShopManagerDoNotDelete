
import { z } from "zod";

// Default shops array
export const shops = [
  { id: "default-shop", name: "Main Location" }
];

// Define which fields are required
export const requiredFields = {
  first_name: true,
  last_name: true,
  shop_id: true,
};

// Define the schema for vehicle data
const vehicleSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  vin: z.string().optional(),
  license_plate: z.string().optional(),
});

// Define the main form schema
export const customerSchema = z.object({
  // Personal Info
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
  
  // Shop assignment
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
  
  // Vehicles and Tags
  vehicles: z.array(vehicleSchema).default([]),
  tags: z.array(z.string()).default([]),
  segments: z.array(z.string()).default([]),
});

// Type definition for the form values
export type CustomerFormValues = z.infer<typeof customerSchema>;

// Default values for the form
export const defaultCustomerFormValues: CustomerFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  company: "",
  business_type: "",
  business_industry: "",
  tax_id: "",
  business_email: "",
  business_phone: "",
  preferred_payment_method: "",
  auto_billing: false,
  credit_terms: "",
  terms_agreed: false,
  is_fleet: false,
  fleet_company: "",
  fleet_manager: "",
  fleet_contact: "",
  preferred_service_type: "",
  notes: "",
  shop_id: "",
  preferred_technician_id: "",
  communication_preference: "",
  referral_source: "",
  referral_person_id: "",
  other_referral_details: "",
  household_id: "",
  create_new_household: false,
  new_household_name: "",
  household_relationship: "",
  vehicles: [],
  tags: [],
  segments: [],
};
