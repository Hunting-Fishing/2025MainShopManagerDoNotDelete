
import { VinDecodeResult } from "@/types/vehicle";

/**
 * Decode a VIN number using an external NHTSA API service
 */
export const decodeVin = async (vin: string): Promise<VinDecodeResult | null> => {
  console.log(`Decoding VIN: ${vin}`);
  
  try {
    // Validate VIN format
    if (!vin || vin.length !== 17) {
      console.error("Invalid VIN format - must be 17 characters");
      return null;
    }
    
    // Call the real NHTSA VIN decoder API
    const apiUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`;
    console.log("Calling NHTSA API:", apiUrl);
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error("Error from NHTSA API:", response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    // Check if we got valid results
    if (data.Results && data.Results.length > 0) {
      const result = data.Results[0];
      
      // Check if the VIN was successfully decoded
      if (result.ErrorCode !== "0") {
        console.error("VIN decode error:", result.ErrorText);
        return null;
      }
      
      // Map API response to our internal structure
      const vinData: VinDecodeResult = {
        year: result.ModelYear || "",
        make: result.Make?.toLowerCase() || "",
        model: result.Model || "",
        trim: result.Trim || "",
        drive_type: result.DriveType || "",
        fuel_type: result.FuelTypePrimary || "",
        transmission: result.TransmissionStyle || "Automatic", // API often doesn't return this
        transmission_type: result.TransmissionSpeeds ? `${result.TransmissionSpeeds}-Speed ${result.TransmissionStyle || "Automatic"}` : undefined,
        body_style: mapBodyStyle(result.BodyClass),
        country: result.PlantCountry || "",
        engine: getEngineInfo(result),
        gvwr: result.GVWR || "",
      };
      
      console.log("Successfully decoded VIN from NHTSA API:", vinData);
      return vinData;
    }
    
    console.log("No valid data found in NHTSA API response");
    return null;
  } catch (error) {
    console.error("Error in VIN decoding:", error);
    return null;
  }
};

/**
 * Helper function to map NHTSA body class to our internal body style
 */
function mapBodyStyle(bodyClass: string | undefined): string | undefined {
  if (!bodyClass) return undefined;
  
  const bodyClassLower = bodyClass.toLowerCase();
  
  if (bodyClassLower.includes("sedan")) return "sedan";
  if (bodyClassLower.includes("suv") || bodyClassLower.includes("multi-purpose") || bodyClassLower.includes("sport utility")) return "suv";
  if (bodyClassLower.includes("truck") || bodyClassLower.includes("pickup")) return "truck";
  if (bodyClassLower.includes("hatchback")) return "hatchback";
  if (bodyClassLower.includes("van") || bodyClassLower.includes("minivan")) return "van";
  
  // Default to sedan if unknown
  return "sedan";
}

/**
 * Helper function to format engine information from NHTSA data
 */
function getEngineInfo(result: any): string | undefined {
  const parts = [];
  
  if (result.DisplacementL) {
    parts.push(`${result.DisplacementL}L`);
  }
  
  if (result.EngineCylinders) {
    parts.push(`${result.EngineCylinders}-cylinder`);
  }
  
  if (result.EngineConfiguration) {
    parts.push(result.EngineConfiguration);
  }
  
  if (result.Turbo === "Y") {
    parts.push("Turbo");
  }
  
  return parts.length > 0 ? parts.join(" ") : undefined;
}
