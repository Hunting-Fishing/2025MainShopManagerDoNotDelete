
import { VinDecodeResult } from "@/types/vehicle";
import { toast } from "@/hooks/use-toast";
import { decodeVin as externalDecodeVin } from "@/services/vinDecoderService";
import { normalizeBodyStyle } from "@/types/vehicleBodyStyles";
import { supabase } from "@/lib/supabase";

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
      
      // Normalize the body style
      if (decodedData.body_style) {
        decodedData.body_style = normalizeBodyStyle(decodedData.body_style);
      }
      
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
        const enhancedVehicle = { 
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
        
        // If this is a database vehicle with an ID, update the record
        if (vehicle.id) {
          const { error } = await supabase
            .from('vehicles')
            .update({
              transmission: enhancedVehicle.transmission,
              transmission_type: enhancedVehicle.transmission_type,
              drive_type: enhancedVehicle.drive_type,
              fuel_type: enhancedVehicle.fuel_type,
              engine: enhancedVehicle.engine,
              body_style: enhancedVehicle.body_style,
              country: enhancedVehicle.country,
              trim: enhancedVehicle.trim,
              gvwr: enhancedVehicle.gvwr
            })
            .eq('id', vehicle.id);
            
          if (error) {
            console.error("Error updating vehicle with enhanced data:", error);
          } else {
            console.log("Successfully updated vehicle with enhanced data");
          }
        }
        
        return enhancedVehicle;
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

/**
 * Get vehicle display name in a consistent format
 */
export const getVehicleDisplayName = (vehicle: any): string => {
  if (!vehicle) return 'Unknown Vehicle';
  
  const year = vehicle.year || '';
  const make = vehicle.make || '';
  const model = vehicle.model || '';
  const trim = vehicle.trim ? ` ${vehicle.trim}` : '';
  
  return `${year} ${make} ${model}${trim}`.trim() || 'Unknown Vehicle';
};

/**
 * Save a vehicle to the database
 */
export const saveVehicle = async (vehicle: any, customerId: string) => {
  try {
    if (!customerId) {
      console.error("Cannot save vehicle without customer ID");
      return null;
    }

    // Convert year to number if it's a string
    let vehicleYear = vehicle.year;
    if (typeof vehicleYear === 'string') {
      vehicleYear = parseInt(vehicleYear, 10) || null;
    }

    const vehicleData = {
      customer_id: customerId,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicleYear,
      vin: vehicle.vin || null,
      license_plate: vehicle.license_plate || null,
      color: vehicle.color || null,
      transmission: vehicle.transmission || null,
      transmission_type: vehicle.transmission_type || null,
      drive_type: vehicle.drive_type || null,
      fuel_type: vehicle.fuel_type || null,
      engine: vehicle.engine || null,
      body_style: vehicle.body_style || null,
      country: vehicle.country || null,
      trim: vehicle.trim || null,
      gvwr: vehicle.gvwr || null
    };

    let result;
    if (vehicle.id) {
      // Update existing vehicle
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', vehicle.id)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else {
      // Insert new vehicle
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error) {
    console.error("Error saving vehicle:", error);
    toast({
      title: "Save Error",
      description: "Failed to save vehicle information",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Get all vehicles for a customer
 */
export const getCustomerVehicles = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerId)
      .order('year', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting customer vehicles:", error);
    return [];
  }
};

/**
 * Get a single vehicle by ID
 */
export const getVehicleById = async (vehicleId: string) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting vehicle:", error);
    return null;
  }
};
