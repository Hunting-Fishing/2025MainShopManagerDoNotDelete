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
  other_business_industry: z.string().optional().or(z.literal(""))
    .refine(
      (val, ctx) => {
        // If business_industry is 'other', then other_business_industry is required
        const businessIndustry = ctx.path[0] === 'other_business_industry' 
          ? (ctx.parent as any).business_industry 
          : '';
          
        return businessIndustry !== 'other' || (businessIndustry === 'other' && val && val.trim() !== '');
      },
      {
        message: "Please specify the industry when 'Other' is selected",
        path: ['other_business_industry']
      }
    ),
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
  other_business_industry: "",
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

// Adding missing exports for components
// Country and region data
export const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" }
];

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
  { code: "AS", name: "American Samoa" },
  { code: "GU", name: "Guam" },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "PR", name: "Puerto Rico" },
  { code: "VI", name: "U.S. Virgin Islands" }
];

export const canadianProvinces = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" }
];

// Relationship types for household members
export const relationshipTypes = [
  { id: "primary", label: "Primary Contact" },
  { id: "spouse", label: "Spouse/Partner" },
  { id: "child", label: "Child" },
  { id: "parent", label: "Parent" },
  { id: "relative", label: "Other Relative" },
  { id: "roommate", label: "Roommate" },
  { id: "other", label: "Other" }
];

// Predefined tags for customer tagging
export const predefinedTags = [
  { id: "vip", label: "VIP", color: "bg-purple-500" },
  { id: "new", label: "New Customer", color: "bg-green-500" },
  { id: "repeat", label: "Repeat Customer", color: "bg-blue-500" },
  { id: "credit-hold", label: "Credit Hold", color: "bg-red-500" },
  { id: "priority", label: "Priority", color: "bg-orange-500" },
  { id: "warranty", label: "Under Warranty", color: "bg-teal-500" },
  { id: "commercial", label: "Commercial", color: "bg-slate-500" },
  { id: "residential", label: "Residential", color: "bg-amber-500" },
  { id: "online", label: "Online Booking", color: "bg-cyan-500" },
  { id: "referred", label: "Referred", color: "bg-pink-500" }
];

// Customer segments
export const predefinedSegments = [
  { id: "high-value", label: "High Value", color: "bg-emerald-500", description: "Customers with high lifetime value" },
  { id: "loyal", label: "Loyal Customer", color: "bg-blue-500", description: "Regular repeat customers" },
  { id: "new", label: "New Customer", color: "bg-green-500", description: "Customers added in the last 30 days" },
  { id: "at-risk", label: "At Risk", color: "bg-red-500", description: "Customers who may not return" },
  { id: "seasonal", label: "Seasonal", color: "bg-amber-500", description: "Customers who visit during specific seasons" },
  { id: "infrequent", label: "Infrequent", color: "bg-gray-500", description: "Customers who visit less than once per year" },
  { id: "commercial", label: "Commercial", color: "bg-slate-500", description: "Business customers" },
  { id: "promotional", label: "Promotional", color: "bg-purple-500", description: "Customers who respond to promotions" }
];

// Referral sources
export const referralSources = [
  "Google Search",
  "Yelp",
  "Facebook",
  "Instagram",
  "Customer Referral",
  "Walk-in",
  "Website",
  "Advertisement",
  "Direct Mail",
  "Radio",
  "Television",
  "Local Event",
  "Other"
];

// Technicians list 
export const technicians = [
  { id: "tech1", name: "John Smith", status: "Active" },
  { id: "tech2", name: "Maria Garcia", status: "Active" },
  { id: "tech3", name: "David Johnson", status: "Active" },
  { id: "tech4", name: "Sarah Williams", status: "On Leave" },
  { id: "tech5", name: "Michael Brown", status: "Active" },
  { id: "tech6", name: "Jennifer Davis", status: "Inactive" },
  { id: "tech7", name: "Robert Miller", status: "Active" },
  { id: "tech8", name: "Jessica Wilson", status: "Terminated" },
  { id: "tech9", name: "Thomas Moore", status: "Active" },
  { id: "tech10", name: "Patricia Taylor", status: "Active" }
];
