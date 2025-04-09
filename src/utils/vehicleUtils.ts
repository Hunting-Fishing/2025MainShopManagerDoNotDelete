
import { VinDecodeResult } from "@/types/vehicle";
import { mockVinDatabase } from "@/data/vinDatabase";

/**
 * Decodes a VIN using our mock VIN database
 * In a real app, this would call an API
 */
export const decodeVin = async (vin: string): Promise<VinDecodeResult | null> => {
  // For demo purposes, we're using a mock database with VIN prefixes
  try {
    console.log("Decoding VIN:", vin);
    if (!vin || vin.length !== 17) {
      console.error("Invalid VIN format");
      return null;
    }
    
    // Find a matching entry in our mock database using the first 8 chars of the VIN
    const prefix = vin.substring(0, 8);
    const match = mockVinDatabase[prefix];
    
    if (match) {
      console.log("VIN match found:", match);
      return {
        ...match
        // Don't add the VIN property here as it's not in the VinDecodeResult type
      };
    }
    
    // No match found
    console.log("No VIN match found in database");
    return null;
  } catch (error) {
    console.error("Error in VIN decoding:", error);
    return null;
  }
};

/**
 * Enhance a vehicle with additional data from VIN decoding
 */
export const enhanceVehicleWithVin = async (vehicle: any) => {
  if (vehicle.vin && (!vehicle.transmission || !vehicle.drive_type)) {
    try {
      const decoded = await decodeVin(vehicle.vin);
      if (decoded) {
        // Merge decoded data with existing vehicle data
        return { 
          ...vehicle, 
          transmission: vehicle.transmission || decoded.transmission,
          transmission_type: vehicle.transmission_type || decoded.transmission_type,
          drive_type: vehicle.drive_type || decoded.drive_type,
          fuel_type: vehicle.fuel_type || decoded.fuel_type,
          engine: vehicle.engine || decoded.engine,
          body_style: vehicle.body_style || decoded.body_style,
          country: vehicle.country || decoded.country,
          trim: vehicle.trim || decoded.trim,
          gvwr: vehicle.gvwr || decoded.gvwr
        };
      }
    } catch (error) {
      console.error("Error enhancing vehicle with VIN data:", error);
    }
  }
  
  return vehicle;
};
