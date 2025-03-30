
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
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

// Mock shop data for demonstration
// In a real app, this would come from an API or context
export const shops = [
  { id: "DEFAULT-SHOP-ID", name: "Main Shop" },
  { id: "SHOP-2", name: "Downtown Branch" },
  { id: "SHOP-3", name: "West Side Service" }
];
