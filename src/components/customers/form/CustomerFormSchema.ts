
import { z } from "zod";

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
  company: z.string().optional(),
  notes: z.string().optional(), // Keep this in the form schema for UI, but it won't be stored in the customers table
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
  { id: "DEFAULT-SHOP-ID", name: "Main Shop" },
  { id: "SHOP-2", name: "Downtown Branch" },
  { id: "SHOP-3", name: "West Side Service" }
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
