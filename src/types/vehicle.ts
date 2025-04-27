
export type VehicleBodyStyle = 
  | 'sedan'
  | 'suv'
  | 'coupe'
  | 'truck'
  | 'van'
  | 'wagon'
  | 'hatchback'
  | 'convertible'
  | 'crossover'
  | 'minivan'
  | 'pickup'
  | 'bus'
  | 'motorcycle'
  | 'off-road'
  | 'other';

// Add missing exports that many files depend on
export interface VinDecodeResult {
  year: string | number;
  make: string;
  model: string;
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

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  transmission?: string;
  transmission_type?: string;
  drive_type?: string;
  engine?: string;
  fuel_type?: string;
  body_style?: string;
  country?: string;
  gvwr?: string;
  trim?: string;
  last_service_date?: string;
  color?: string;
}

export interface CarMake {
  make_id: string;
  make_display: string;
  make_is_common?: string;
  make_country?: string;
}

export interface CarModel {
  model_name: string;
  model_make_id: string;
}

// Re-export vehicle body style types
export const VEHICLE_BODY_STYLES: VehicleBodyStyle[] = [
  'sedan', 'suv', 'coupe', 'truck', 'van', 'wagon', 'hatchback',
  'convertible', 'crossover', 'minivan', 'pickup', 'bus',
  'motorcycle', 'off-road', 'other'
];
