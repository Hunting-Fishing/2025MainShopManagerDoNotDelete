import * as z from "zod";

// Regex for phone validation
export const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;

// Vehicle schema for validation
export const vehicleSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  vin: z.string().optional(),
  license_plate: z.string().optional(),
});

// Form validation schema
export const customerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").or(z.string().length(0)),
  phone: z.string().regex(PHONE_REGEX, "Invalid phone format").or(z.string().length(0)),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  shop_id: z.string().min(1, "Shop is required"),
  tags: z.string().array().optional().default([]),
  
  // Enhanced fields
  preferred_technician_id: z.string().optional().transform(val => val === "_none" ? "" : val),
  // NOTE: communication_preference doesn't exist in the database schema - UI only
  communication_preference: z.string().optional().transform(val => val === "_none" ? "" : val),
  referral_source: z.string().optional().transform(val => val === "_none" ? "" : val),
  referral_person_id: z.string().optional(),
  other_referral_details: z.string().optional(),
  household_id: z.string().optional(),
  is_fleet: z.boolean().optional().default(false),
  fleet_company: z.string().optional(),
  
  // Vehicle fields with proper validation
  vehicles: z.array(vehicleSchema).optional().default([]),

  // New fields for Phase 3
  segments: z.string().array().optional().default([]),
  create_new_household: z.boolean().optional().default(false),
  new_household_name: z.string().optional(),
  household_relationship: z.string().optional(),
}).refine((data) => {
  // If referral source is "Other", other_referral_details must not be empty
  if (data.referral_source === "Other") {
    return !!data.other_referral_details;
  }
  return true;
}, {
  message: "Please specify referral details for 'Other' referral source",
  path: ["other_referral_details"],
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

// Mock shop data for demonstration
// In a real app, this would come from an API or context
export const shops = [
  { id: "00000000-0000-0000-0000-000000000000", name: "Main Shop" },
  { id: "11111111-1111-1111-1111-111111111111", name: "Downtown Branch" },
  { id: "22222222-2222-2222-2222-222222222222", name: "West Side Service" }
];

// Mock technician data
export const technicians = [
  { id: "tech1", name: "Sarah Johnson", status: "Active" },
  { id: "tech2", name: "Michael Brown", status: "Active" },
  { id: "tech3", name: "Emily Chen", status: "Active" },
  { id: "tech4", name: "David Lee", status: "Inactive" },
  { id: "tech5", name: "Robert Garcia", status: "On Leave" },
  { id: "tech6", name: "James Wilson", status: "Terminated" },
];

// Mock referral sources
export const referralSources = [
  "Website",
  "Google Search",
  "Social Media",
  "Friend/Family",
  "Existing Customer",
  "Advertisement",
  "Business Card",
  "Local Event",
  "Other"
];

// Predefined tags for customers
export const predefinedTags = [
  { id: "vip", label: "VIP", color: "bg-amber-500" },
  { id: "new", label: "New Customer", color: "bg-green-500" },
  { id: "priority", label: "Priority", color: "bg-red-500" },
  { id: "commercial", label: "Commercial", color: "bg-blue-500" },
  { id: "residential", label: "Residential", color: "bg-indigo-500" },
  { id: "warranty", label: "Warranty", color: "bg-purple-500" },
  { id: "maintenance", label: "Maintenance Plan", color: "bg-cyan-500" },
  { id: "contract", label: "Contract", color: "bg-teal-500" },
  { id: "recurring", label: "Recurring", color: "bg-pink-500" },
  { id: "leads", label: "Leads", color: "bg-orange-500" },
];

// Customer relationship types
export const relationshipTypes = [
  { id: "primary", label: "Primary" },
  { id: "spouse", label: "Spouse" },
  { id: "partner", label: "Partner" },
  { id: "child", label: "Child" },
  { id: "parent", label: "Parent" },
  { id: "sibling", label: "Sibling" },
  { id: "other", label: "Other" }
];

// Customer segments for dropdown
export const predefinedSegments = [
  { id: "high_value", label: "High Value", color: "bg-emerald-500" },
  { id: "regular", label: "Regular", color: "bg-blue-500" },
  { id: "infrequent", label: "Infrequent", color: "bg-yellow-500" },
  { id: "new", label: "New", color: "bg-green-500" },
  { id: "dormant", label: "Dormant", color: "bg-gray-500" },
];

// Helper to identify required fields for UI purposes
export const requiredFields = {
  first_name: true,
  last_name: true,
  shop_id: true
};

// Countries for dropdown
export const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
];

// US States for dropdown
export const usStates = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

// Canadian Provinces for dropdown
export const canadianProvinces = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];
