
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
  notes: z.string().optional(),
  shop_id: z.string().min(1, "Shop is required"),
  tags: z.string().array().optional().default([]),
  
  // New fields
  preferred_technician_id: z.string().optional().transform(val => val === "_none" ? "" : val),
  referral_source: z.string().optional().transform(val => val === "_none" ? "" : val),
  referral_person_id: z.string().optional(),
  household_id: z.string().optional(),
  is_fleet: z.boolean().optional().default(false),
  fleet_company: z.string().optional(),
  
  // Vehicle fields with proper validation
  vehicles: z.array(vehicleSchema).optional().default([]),
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
  { id: "TECH-1", name: "Sarah Johnson" },
  { id: "TECH-2", name: "Michael Brown" },
  { id: "TECH-3", name: "Emily Chen" },
  { id: "TECH-4", name: "David Lee" },
];

// Mock referral sources
export const referralSources = [
  "Web Search",
  "Social Media",
  "Friend Referral",
  "Advertisement",
  "Existing Customer",
  "Walk-in",
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

// Helper to identify required fields for UI purposes
export const requiredFields = {
  first_name: true,
  last_name: true,
  shop_id: true
};
