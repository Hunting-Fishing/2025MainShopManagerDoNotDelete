
import { z } from "zod";

// Regex for phone validation
export const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;

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
  tags: z.string().optional(),
  
  // New fields
  preferred_technician_id: z.string().optional().transform(val => val === "_none" ? "" : val),
  referral_source: z.string().optional().transform(val => val === "_none" ? "" : val),
  referral_person_id: z.string().optional(),
  household_id: z.string().optional(),
  is_fleet: z.boolean().optional().default(false),
  fleet_company: z.string().optional(),
  
  // Vehicle fields will be handled separately
  vehicles: z.array(
    z.object({
      make: z.string().optional(),
      model: z.string().optional(),
      year: z.string().optional(),
      vin: z.string().optional(),
      license_plate: z.string().optional(),
    })
  ).optional().default([]),
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
