
import { z } from "zod";

// Vehicle schema definition
export const vehicleSchema = z.object({
  id: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  vin: z.string().optional(),
  license_plate: z.string().optional(),
  color: z.string().optional(),
  
  // Additional vehicle details
  transmission_type: z.string().optional(),
  drive_type: z.string().optional(),
  fuel_type: z.string().optional(),
  engine: z.string().optional(),
  body_style: z.string().optional(),
  country: z.string().optional(),
  trim: z.string().optional(),
  gvwr: z.string().optional()
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
