
export interface CustomerVehicle {
  id?: string;
  customer_id?: string;
  make?: string; // Optional for flexibility
  model?: string; // Optional for flexibility
  year?: string;
  vin?: string;
  license_plate?: string;
  color?: string;
  trim?: string;
  body_style?: string;
  drive_type?: string;
  engine?: string;
  fuel_type?: string;
  transmission?: string;
  mileage?: string;
  gvwr?: string;
  country?: string;
  notes?: string;
  is_primary?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
  
  // Decoded VIN fields (all optional)
  decoded_make?: string;
  decoded_model?: string;
  decoded_year?: string;
  decoded_trim?: string;
  decoded_body_style?: string;
  decoded_drive_type?: string;
  decoded_engine?: string;
  decoded_fuel_type?: string;
  decoded_transmission?: string;
  decoded_gvwr?: string;
}

export interface VehicleCreate {
  customer_id: string;
  make?: string;
  model?: string;
  year?: string;
  vin?: string;
  license_plate?: string;
  color?: string;
  trim?: string;
  body_style?: string;
  drive_type?: string;
  engine?: string;
  fuel_type?: string;
  transmission?: string;
  mileage?: string;
  gvwr?: string;
  country?: string;
  notes?: string;
  is_primary?: boolean;
  status?: string;
}

export interface VehicleUpdate {
  id: string;
  make?: string;
  model?: string;
  year?: string;
  vin?: string;
  license_plate?: string;
  color?: string;
  trim?: string;
  body_style?: string;
  drive_type?: string;
  engine?: string;
  fuel_type?: string;
  transmission?: string;
  mileage?: string;
  gvwr?: string;
  country?: string;
  notes?: string;
  is_primary?: boolean;
  status?: string;
}
