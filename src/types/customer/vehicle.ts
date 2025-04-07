
// Vehicle-related type definitions
export interface CustomerVehicle {
  id?: string; // Making id optional for creation
  year?: number;
  make?: string;
  model?: string;
  vin?: string;
  license_plate?: string;
  color?: string;
  last_service_date?: string;
}
