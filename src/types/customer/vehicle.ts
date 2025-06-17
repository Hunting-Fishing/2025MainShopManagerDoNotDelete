
// Vehicle-related type definitions
export interface CustomerVehicle {
  id?: string;
  customer_id?: string;
  year: string | number; // Make year flexible to handle both string and number
  make: string;
  model: string;
  vin?: string;
  license_plate?: string;
  trim?: string;
  last_service_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Additional vehicle details
  transmission?: string;
  transmission_type?: string;
  drive_type?: string;
  fuel_type?: string;
  engine?: string;
  body_style?: string;
  country?: string;
  gvwr?: string;
  color?: string;
}

// Consistent conversion function to handle both string and number year values
export const formatVehicleYear = (year: number | string | undefined): string => {
  if (year === undefined || year === null) return '';
  return year.toString();
};

// Format vehicle display name consistently
export const getVehicleDisplayName = (vehicle: CustomerVehicle): string => {
  const year = formatVehicleYear(vehicle.year);
  const make = vehicle.make || '';
  const model = vehicle.model || '';
  const trim = vehicle.trim ? ` ${vehicle.trim}` : '';
  
  return `${year} ${make} ${model}${trim}`.trim();
};
