import { z } from "zod";

// Re-export everything from the new schema files
export * from "./schemas/customerSchema";
export * from "./schemas/defaultValues";
export * from "./schemas/locationData";
export * from "./schemas/relationshipData";
export * from "./schemas/vehicleSchema";
export * from "./schemas/validationRules";

// Import the useBusinessConstants hook instead of direct imports
import { useBusinessConstants } from "@/hooks/useBusinessConstants";

// Re-export individually to avoid naming conflicts
export { 
  useBusinessConstants
};

// Keep backward compatibility by re-exporting the main schemas
import { customerSchema } from "./schemas/customerSchema";
import { defaultCustomerFormValues } from "./schemas/defaultValues";
import { shops } from "./schemas/relationshipData";

// Re-export these items for backward compatibility
export { customerSchema, defaultCustomerFormValues, shops };
export type CustomerFormValues = z.infer<typeof customerSchema>;

// Define technicians and referralSources that are being used
export const technicians = [
  { id: "TM001", name: "John Smith", status: "Active" },
  { id: "TM002", name: "Sarah Johnson", status: "Active" },
  { id: "TM003", name: "Michael Brown", status: "Active" },
  { id: "TM004", name: "Emily Chen", status: "Active" },
  { id: "TM005", name: "David Lee", status: "Inactive" },
  { id: "TM006", name: "Jessica Williams", status: "On Leave" },
  { id: "TM007", name: "Robert Garcia", status: "Terminated" },
];

export const referralSources = [
  "Google",
  "Facebook",
  "Instagram",
  "Friend/Family",
  "Existing Customer",
  "Local Advertisement",
  "Direct Mail",
  "Website",
  "Email Campaign",
  "Review Site",
  "Community Event",
  "Business Partner",
  "Other"
];

// Define payment methods, business types, etc. directly here since they're needed
export const paymentMethods = [
  { value: "credit_card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "venmo", label: "Venmo" },
  { value: "apple_pay", label: "Apple Pay" },
  { value: "google_pay", label: "Google Pay" },
];

export const businessTypes = [
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "s_corporation", label: "S Corporation" },
  { value: "c_corporation", label: "C Corporation" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" }
];

export const businessIndustries = [
  { value: "automotive", label: "Automotive" },
  { value: "construction", label: "Construction" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance & Banking" },
  { value: "food_service", label: "Food Service" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality", label: "Hospitality" },
  { value: "information_technology", label: "Information Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "professional_services", label: "Professional Services" },
  { value: "real_estate", label: "Real Estate" },
  { value: "retail", label: "Retail" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "other", label: "Other" }
];

export const creditTermsOptions = [
  { value: "net_15", label: "Net 15" },
  { value: "net_30", label: "Net 30" },
  { value: "net_45", label: "Net 45" },
  { value: "net_60", label: "Net 60" },
  { value: "due_on_receipt", label: "Due on Receipt" },
  { value: "custom", label: "Custom" }
];

export const serviceTypes = [
  { value: "maintenance", label: "Regular Maintenance" },
  { value: "repair", label: "Repair Services" },
  { value: "diagnostic", label: "Diagnostic Services" },
  { value: "emergency", label: "Emergency Services" },
  { value: "installation", label: "Installation Services" },
  { value: "custom", label: "Custom Services" }
];

// Export with the original name for backward compatibility
export const predefinedTags = [];
