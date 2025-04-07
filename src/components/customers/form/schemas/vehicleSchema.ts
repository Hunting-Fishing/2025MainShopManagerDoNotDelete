
import { z } from "zod";

// Define schema for vehicle data
export interface VehicleFormData {
  id?: string;
  make: string;
  model: string;
  year: string;
  vin?: string;
  license_plate?: string;
  color?: string;
  
  // Additional vehicle details
  transmission?: string;
  drive_type?: string; 
  fuel_type?: string;
  engine?: string;
  body_style?: string;
  country?: string;
  transmission_type?: string; // New field for transmission type
  gvwr?: string; // New field for GVWR (Gross Vehicle Weight Rating)
}

// Default empty vehicle
export const emptyVehicle: VehicleFormData = {
  make: '',
  model: '',
  year: '',
  vin: '',
  license_plate: '',
  color: '',
  transmission: '',
  drive_type: '',
  fuel_type: '',
  engine: '',
  body_style: '',
  country: '',
  transmission_type: '', // Initialize new field
  gvwr: '' // Initialize new field
};

// Add the vehicleSchema export using Zod
export const vehicleSchema = z.object({
  id: z.string().optional(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().min(1, "Year is required"),
  vin: z.string().optional().or(z.literal("")),
  license_plate: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  transmission: z.string().optional().or(z.literal("")),
  drive_type: z.string().optional().or(z.literal("")),
  fuel_type: z.string().optional().or(z.literal("")),
  engine: z.string().optional().or(z.literal("")),
  body_style: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  transmission_type: z.string().optional().or(z.literal("")), // Add validation for new field
  gvwr: z.string().optional().or(z.literal("")) // Add validation for new field
});
