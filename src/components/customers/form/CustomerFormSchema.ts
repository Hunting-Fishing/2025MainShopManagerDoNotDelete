
import { z } from "zod";
import { vehicleSchema } from "./schemas/vehicleSchema";

// Base customer schema
export const customerFormSchema = z.object({
  // Personal Information
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  
  // Address
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  postal_code: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  
  // Business Information
  company_name: z.string().optional().or(z.literal("")),
  business_type: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  
  // Contact Preferences
  preferred_contact_method: z.string().optional().or(z.literal("")),
  communication_preferences: z.array(z.string()).optional(),
  
  // Additional Information
  date_of_birth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  
  // Customer Relationship
  customer_since: z.string().optional().or(z.literal("")),
  customer_type: z.string().optional().or(z.literal("")),
  referral_source: z.string().optional().or(z.literal("")),
  
  // Marketing
  marketing_consent: z.boolean().optional(),
  newsletter_subscription: z.boolean().optional(),
  
  // Tags and Segments
  tags: z.array(z.string()).optional(),
  segments: z.array(z.string()).optional(),
  
  // Internal Notes
  notes: z.string().optional().or(z.literal("")),
  internal_notes: z.string().optional().or(z.literal("")),
  
  // Vehicles
  vehicles: z.array(vehicleSchema).optional(),
  
  // Shop Association
  shop_id: z.string().optional(),
  
  // Emergency Contact
  emergency_contact_name: z.string().optional().or(z.literal("")),
  emergency_contact_phone: z.string().optional().or(z.literal("")),
  emergency_contact_relationship: z.string().optional().or(z.literal("")),
  
  // Billing Information
  billing_address: z.string().optional().or(z.literal("")),
  billing_city: z.string().optional().or(z.literal("")),
  billing_state: z.string().optional().or(z.literal("")),
  billing_postal_code: z.string().optional().or(z.literal("")),
  billing_country: z.string().optional().or(z.literal("")),
  
  // Payment Information
  preferred_payment_method: z.string().optional().or(z.literal("")),
  credit_limit: z.number().optional(),
  
  // Account Status
  is_active: z.boolean().optional(),
  account_status: z.string().optional().or(z.literal("")),
  
  // Household Information (form-specific)
  household_size: z.number().optional(),
  household_income_range: z.string().optional().or(z.literal("")),
  household_relationship: z.string().optional().or(z.literal("")),
  
  // Missing fields that are used in forms
  preferred_technician_id: z.string().optional().or(z.literal("")),
  communication_preference: z.string().optional().or(z.literal("")),
  referral_person_id: z.string().optional().or(z.literal("")),
  other_referral_details: z.string().optional().or(z.literal("")),
  household_id: z.string().optional().or(z.literal("")),
  create_new_household: z.boolean().default(false),
  new_household_name: z.string().optional().or(z.literal("")),
});

// Export the inferred type
export type CustomerFormValues = z.infer<typeof customerFormSchema>;

// Default values for the form
export const defaultCustomerFormValues: Partial<CustomerFormValues> = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  company_name: "",
  business_type: "",
  industry: "",
  preferred_contact_method: "",
  communication_preferences: [],
  date_of_birth: "",
  gender: "",
  occupation: "",
  customer_since: "",
  customer_type: "individual",
  referral_source: "",
  marketing_consent: false,
  newsletter_subscription: false,
  tags: [],
  segments: [],
  notes: "",
  internal_notes: "",
  vehicles: [],
  shop_id: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  billing_address: "",
  billing_city: "",
  billing_state: "",
  billing_postal_code: "",
  billing_country: "",
  preferred_payment_method: "",
  credit_limit: 0,
  is_active: true,
  account_status: "active",
  household_size: 1,
  household_income_range: "",
  household_relationship: "",
  preferred_technician_id: "",
  communication_preference: "",
  referral_person_id: "",
  other_referral_details: "",
  household_id: "",
  create_new_household: false,
  new_household_name: "",
};

// Export predefined segments and relationship types for backwards compatibility
export const predefinedSegments: string[] = [];
export const relationshipTypes = [
  { id: "spouse", label: "Spouse" },
  { id: "parent", label: "Parent" },
  { id: "child", label: "Child" },
  { id: "sibling", label: "Sibling" },
  { id: "other", label: "Other" }
];
