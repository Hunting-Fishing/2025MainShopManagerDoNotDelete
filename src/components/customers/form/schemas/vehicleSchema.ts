
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
  country: ''
};
