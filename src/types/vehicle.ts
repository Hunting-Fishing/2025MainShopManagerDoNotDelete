
export interface VinDecodeResult {
  year?: string | number;
  make?: string;
  model?: string;
  transmission?: string;
  transmission_type?: string;
  drive_type?: string;
  fuel_type?: string;
  body_style?: string;
  country?: string;
  engine?: string;
  gvwr?: string;
  trim?: string;  // Added trim property
}

export interface Vehicle {
  id: string;
  vin?: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  license_plate?: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  last_service_date?: string;
  transmission?: string;
  transmission_type?: string; 
  drive_type?: string;
  fuel_type?: string;
  body_style?: string;
  country?: string;
  engine?: string;
  gvwr?: string;
  trim?: string;
}

// Add CarMake and CarModel interfaces
export interface CarMake {
  make_id: string;
  make_display: string;
  make_is_common: string;
  make_country: string;
}

export interface CarModel {
  model_name: string;
  model_make_id: string;
}
