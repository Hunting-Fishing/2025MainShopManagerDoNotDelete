
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
  PlantCountry: string;
  TransmissionStyle?: string;
  GVWR?: string;           // Added GVWR field
  TransmissionType?: string;  // Added TransmissionType field
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
 * Format drive type to a more readable format
 */
const formatDriveType = (driveType: string): string => {
  if (!driveType) return "";
  
  driveType = driveType.toUpperCase();
  if (driveType.includes("4X4") || driveType.includes("FOUR-WHEEL")) return "4x4";
  if (driveType.includes("4X2") || driveType.includes("TWO-WHEEL") && driveType.includes("REAR")) return "4x2";
  if (driveType.includes("ALL WHEEL") || driveType.includes("AWD")) return "AWD";
  if (driveType.includes("FRONT WHEEL") || driveType.includes("FWD")) return "FWD";
  if (driveType.includes("REAR WHEEL") || driveType.includes("RWD")) return "RWD";
  
  return driveType;
};

/**
 * Format fuel type to a more readable format
 */
const formatFuelType = (fuelType: string): string => {
  if (!fuelType) return "";
  
  fuelType = fuelType.toLowerCase();
  if (fuelType.includes("gasoline")) return "Gas";
  if (fuelType.includes("diesel")) return "Diesel";
  if (fuelType.includes("electric")) return "Electric";
  if (fuelType.includes("hybrid")) return "Hybrid";
  if (fuelType.includes("plug-in hybrid")) return "Plug-in Hybrid";
  if (fuelType.includes("flex")) return "Flex Fuel";
  if (fuelType.includes("cng")) return "CNG";
  
  return fuelType;
};

/**
 * Format transmission type to a more readable format
 */
const formatTransmission = (transmission: string): string => {
  if (!transmission) return "";
  
  transmission = transmission.toLowerCase();
  if (transmission.includes("automatic")) return "Automatic";
  if (transmission.includes("manual")) return "Manual";
  if (transmission.includes("cvt")) return "CVT";
  if (transmission.includes("dual clutch")) return "Dual Clutch";
  
  // Default to Automatic for most vehicles if we have no specific information
  // but still have some transmission related data. This is a reasonable fallback.
  return "Automatic";
};

/**
 * Format transmission type to a more specific classification
 */
const formatTransmissionType = (transmissionType: string): string => {
  if (!transmissionType) return "";
  
  console.log("Formatting transmission type from:", transmissionType);
  
  transmissionType = transmissionType.toLowerCase();
  if (transmissionType.includes("automatic")) {
    if (transmissionType.includes("cvt")) return "CVT Automatic";
    if (transmissionType.includes("8")) return "8-Speed Automatic";
    if (transmissionType.includes("7")) return "7-Speed Automatic";
    if (transmissionType.includes("6")) return "6-Speed Automatic";
    if (transmissionType.includes("5")) return "5-Speed Automatic";
    if (transmissionType.includes("4")) return "4-Speed Automatic";
    if (transmissionType.includes("10")) return "10-Speed Automatic";
    if (transmissionType.includes("9")) return "9-Speed Automatic";
    if (transmissionType.includes("dual") || transmissionType.includes("dct")) return "Dual-Clutch Automatic";
    return "Automatic";
  }
  
  if (transmissionType.includes("manual")) {
    if (transmissionType.includes("7")) return "7-Speed Manual";
    if (transmissionType.includes("6")) return "6-Speed Manual";
    if (transmissionType.includes("5")) return "5-Speed Manual";
    return "Manual";
  }
  
  if (transmissionType.includes("cvt")) return "CVT Automatic";
  
  return transmissionType;
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
    
    // Build engine information
    let engineInfo = "";
    if (vehicleInfo.EngineCylinders && vehicleInfo.EngineSize) {
      engineInfo = `${vehicleInfo.EngineCylinders}cyl ${vehicleInfo.EngineSize}L`;
    } else if (vehicleInfo.EngineCylinders) {
      engineInfo = `${vehicleInfo.EngineCylinders} cylinder`;
    } else if (vehicleInfo.EngineSize) {
      engineInfo = `${vehicleInfo.EngineSize}L`;
    }

    // Process the transmission type field - if we have TransmissionStyle, use it to detect type
    let transmissionType = formatTransmissionType(vehicleInfo.TransmissionType || "");
    
    // If we don't have a transmission type but have a transmission style, derive the type
    if (!transmissionType && vehicleInfo.TransmissionStyle) {
      transmissionType = formatTransmissionType(vehicleInfo.TransmissionStyle);
    }
    
    // If still no transmission info, check if we have any drivetrain info to infer a likely automatic transmission
    const transmission = formatTransmission(vehicleInfo.TransmissionStyle || "");
    
    // If we still don't have a transmission type but we know it's automatic, provide a generic type
    if (!transmissionType && transmission === "Automatic") {
      transmissionType = "Automatic";
      
      // For newer vehicles (2015+), assume more modern transmissions
      const year = parseInt(vehicleInfo.ModelYear || "0", 10);
      if (year >= 2015) {
        // Specific handling based on make
        if (makeId === "toyota" || makeId === "lexus") {
          transmissionType = "8-Speed Automatic";
        } else if (makeId === "honda" || makeId === "acura") {
          transmissionType = "CVT Automatic";
        } else if (makeId === "ford") {
          transmissionType = "10-Speed Automatic";
        } else if (makeId === "chevrolet" || makeId === "gmc") {
          transmissionType = "6-Speed Automatic";
        } else if (makeId === "bmw" || makeId === "mercedes-benz" || makeId === "audi") {
          transmissionType = "8-Speed Automatic";
        } else {
          transmissionType = "6-Speed Automatic"; // Good default for modern vehicles
        }
      } else {
        transmissionType = "Automatic"; // Generic for older vehicles
      }
    }

    console.log("API TransmissionType:", vehicleInfo.TransmissionType);
    console.log("API TransmissionStyle:", vehicleInfo.TransmissionStyle);
    console.log("Formatted transmissionType:", transmissionType);

    // Map the API response to our VinDecodeResult format with enhanced details
    const result: VinDecodeResult = {
      year: vehicleInfo.ModelYear || "",
      make: makeId,
      model: vehicleInfo.Model || "",
      trim: vehicleInfo.Trim || "",
      drive_type: formatDriveType(vehicleInfo.DriveType || ""),
      fuel_type: formatFuelType(vehicleInfo.FuelTypePrimary || ""),
      transmission: transmission || "Automatic", // Provide a default of Automatic since most vehicles are
      transmission_type: transmissionType || "Automatic", // Use our processed transmission type or default
      body_style: vehicleInfo.BodyClass || "",
      country: vehicleInfo.PlantCountry || "",
      engine: engineInfo,
      gvwr: vehicleInfo.GVWR || "" // Add GVWR
    };

    console.log(`VIN decoded successfully via API: ${normalizedVin} ->`, result);
    return result;
  } catch (error) {
    console.error("Error decoding VIN with API:", error);
    return null;
  }
};
