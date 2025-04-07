
// Vehicle-related type definitions
export interface CustomerVehicle {
  id?: string; // Making id optional for creation
  year?: number;
  make?: string;
  model?: string;
  vin?: string;
  license_plate?: string;
  trim?: string;
  last_service_date?: string;
  // Additional vehicle details
  transmission?: string;
  transmission_type?: string;
  drive_type?: string;
  fuel_type?: string;
  engine?: string;
  body_style?: string;
  country?: string;
  gvwr?: string;
}
