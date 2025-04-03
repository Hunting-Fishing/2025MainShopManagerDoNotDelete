import { z } from "zod";

// Re-export everything from the new schema files
export * from "./schemas/customerSchema";
export * from "./schemas/defaultValues";
export * from "./schemas/locationData";
export * from "./schemas/referenceData";
export * from "./schemas/relationshipData";
export * from "./schemas/vehicleSchema";
export * from "./schemas/validationRules";

// Keep backward compatibility by re-exporting the main schemas
import { customerSchema } from "./schemas/customerSchema";
import { defaultCustomerFormValues } from "./schemas/defaultValues";
import { shops } from "./schemas/relationshipData";

// Re-export these items for backward compatibility
export { customerSchema, defaultCustomerFormValues, shops };
export type CustomerFormValues = z.infer<typeof customerSchema>;
