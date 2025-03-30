
import { VinDecodeResult } from "@/types/vehicle";

// NHTSA Vehicle API endpoint
const NHTSA_API_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/";

/**
 * Interface for the NHTSA API response
 */
interface NhtsaApiResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NhtsaVehicleInfo[];
}

/**
 * Interface for the vehicle information returned by NHTSA API
 */
interface NhtsaVehicleInfo {
  VIN: string;
  ModelYear: string;
  Make: string;
  Model: string;
  Trim: string;
  VehicleType: string;
  BodyClass: string;
  DriveType: string;
  FuelTypePrimary: string;
  FuelTypeSecondary?: string;
  EngineCylinders: string;
  EngineSize: string;
  Manufacturer: string;
  ErrorCode: string;
  ErrorText: string;
  [key: string]: any; // For other properties in the response
}

// Map of manufacturer names to consistent make_id values
const makeNameMap: Record<string, string> = {
  "DODGE": "dodge",
  "CHRYSLER": "chrysler",
  "JEEP": "jeep",
  "RAM": "ram",
  "FORD": "ford",
  "CHEVROLET": "chevrolet",
  "GMC": "gmc",
  "HONDA": "honda",
  "TOYOTA": "toyota",
  "NISSAN": "nissan",
  "HYUNDAI": "hyundai",
  "KIA": "kia",
  "MAZDA": "mazda",
  "BMW": "bmw",
  "MERCEDES-BENZ": "mercedes-benz",
  "AUDI": "audi",
  "LEXUS": "lexus",
  "ACURA": "acura",
  "INFINITI": "infiniti",
  "SUBARU": "subaru",
  "VOLKSWAGEN": "volkswagen",
  "VOLVO": "volvo",
  "TESLA": "tesla",
  "BUICK": "buick",
  "CADILLAC": "cadillac",
  "LINCOLN": "lincoln",
  // Add other mappings as needed
};

/**
 * Decode a VIN using the NHTSA API
 * @param vin The 17-digit Vehicle Identification Number
 * @returns Promise resolving to vehicle information or null if invalid
 */
export const decodeVinWithApi = async (vin: string): Promise<VinDecodeResult | null> => {
  if (!vin || vin.length !== 17) {
    console.log(`Invalid VIN format: ${vin}`);
    return null;
  }

  try {
    const normalizedVin = vin.toUpperCase();
    // Call the NHTSA API with format=json for JSON response
    const response = await fetch(`${NHTSA_API_URL}${normalizedVin}?format=json`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: NhtsaApiResponse = await response.json();
    
    // Check if we got valid results
    if (data.Count === 0 || !data.Results || data.Results.length === 0) {
      console.warn("No results found for VIN:", vin);
      return null;
    }

    const vehicleInfo = data.Results[0];
    
    // Check if there was an API error
    if (vehicleInfo.ErrorCode !== "0" && vehicleInfo.ErrorText) {
      throw new Error(`API error: ${vehicleInfo.ErrorText}`);
    }

    // Normalize the make to match our application's make_id format
    const normalizedMake = vehicleInfo.Make?.toUpperCase() || "";
    const makeId = makeNameMap[normalizedMake] || normalizedMake.toLowerCase();

    // Map the API response to our VinDecodeResult format
    const result: VinDecodeResult = {
      year: vehicleInfo.ModelYear || "",
      make: makeId,
      model: vehicleInfo.Model || "",
      trim: vehicleInfo.Trim || ""
    };

    console.log(`VIN decoded successfully via API: ${normalizedVin} ->`, result);
    return result;
  } catch (error) {
    console.error("Error decoding VIN with API:", error);
    return null;
  }
};
