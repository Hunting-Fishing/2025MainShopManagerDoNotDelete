
export interface VinDecodeResult {
  year?: string;
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
