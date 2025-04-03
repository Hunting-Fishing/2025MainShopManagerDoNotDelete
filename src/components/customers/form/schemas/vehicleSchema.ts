
import { z } from "zod";

// Define the schema for vehicle data
export const vehicleSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  vin: z.string().optional(),
  license_plate: z.string().optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
