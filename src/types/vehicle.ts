
// Define types for vehicle data
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

// Define type for VIN decode result
export interface VinDecodeResult {
  year: string;
  make: string;
  model: string;
  trim?: string;
}
