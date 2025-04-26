import { z } from "zod";

// Re-export everything from the new schema files
export * from "./schemas/customerSchema";
export * from "./schemas/defaultValues";
export * from "./schemas/locationData";
export * from "./schemas/relationshipData";
export * from "./schemas/vehicleSchema";
export * from "./schemas/validationRules";

// Import referenceData but don't re-export everything to avoid conflicts
import { 
  predefinedTags as referenceDataTags,
  paymentMethods, 
  businessTypes,
  businessIndustries,
  creditTermsOptions,
  serviceTypes
} from "./schemas/referenceData";

// Re-export individually to avoid naming conflicts
export { 
  paymentMethods,
  businessTypes,
  businessIndustries,
  creditTermsOptions,
  serviceTypes,
  // Export with the original name for backward compatibility
  referenceDataTags as predefinedTags
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
