
import { VinDecodeResult } from "@/types/vehicle";
import { toast } from "@/hooks/use-toast";
import { decodeVin as externalDecodeVin } from "@/services/vinDecoderService";

/**
 * Decodes a VIN using external service
 */
export const decodeVin = async (vin: string): Promise<VinDecodeResult | null> => {
  try {
    console.log("Decoding VIN:", vin);
    
    // Validate input
    if (!vin) {
      console.error("Missing VIN");
      toast({
        title: "Error",
        description: "VIN is required",
        variant: "destructive",
      });
      return null;
    }
    
    // Check VIN format
    if (vin.length !== 17) {
      console.error("Invalid VIN format - must be 17 characters");
      toast({
        title: "Invalid VIN",
        description: "VIN must be 17 characters long",
        variant: "destructive",
      });
      return null;
    }
    
    // Use the external VIN decoding service to get real data
    const decodedData = await externalDecodeVin(vin);
    
    if (decodedData) {
      console.log("VIN decoded successfully:", decodedData);
      return decodedData;
    }
    
    // No match found
    console.log("No VIN match found");
    toast({
      title: "VIN Not Found",
      description: "No vehicle information was found for this VIN",
      variant: "warning",
    });
    return null;
  } catch (error) {
    console.error("Error in VIN decoding:", error);
    toast({
      title: "Decoding Error",
      description: "An error occurred while processing the VIN",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Enhance a vehicle with additional data from VIN decoding
 */
export const enhanceVehicleWithVin = async (vehicle: any) => {
  if (!vehicle) {
    console.error("Cannot enhance undefined vehicle");
    return vehicle;
  }
  
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
      toast({
        title: "Data Enhancement Failed",
        description: "Could not add additional vehicle information",
        variant: "warning",
      });
    }
  }
  
  return vehicle;
};
