import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VinDecodeResult, Vehicle, CarMake, CarModel } from '@/types/vehicle';
import { mockVinDatabase } from '@/data/vinDatabase';

/**
 * Decode a Vehicle Identification Number (VIN) to get vehicle details
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  try {
    console.log(`Starting VIN decode for: ${vin}`);
    
    // First try to get the VIN from our database if we've seen it before
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vin', vin)
      .maybeSingle();

    if (existingVehicle) {
      console.log("Found existing vehicle in database:", existingVehicle);
      return {
        year: existingVehicle.year,
        make: existingVehicle.make,
        model: existingVehicle.model,
        transmission: existingVehicle.transmission,
        transmission_type: existingVehicle.transmission_type,
        drive_type: existingVehicle.drive_type,
        fuel_type: existingVehicle.fuel_type,
        body_style: existingVehicle.body_style,
        country: existingVehicle.country,
        engine: existingVehicle.engine,
        gvwr: existingVehicle.gvwr,
        trim: existingVehicle.trim
      };
    }

    // Check the mock database for exact match with full VIN
    const exactVinMatch = mockVinDatabase[vin];
    if (exactVinMatch) {
      console.log(`Found exact match in mock database for VIN ${vin}:`, exactVinMatch);
      return exactVinMatch;
    }

    // If no exact match, check by prefix
    console.log("Checking mock VIN database for", vin);
    const vinPrefix = vin.substring(0, 8).toUpperCase();
    
    for (const prefix in mockVinDatabase) {
      if (vinPrefix.startsWith(prefix)) {
        console.log(`Found match in mock database for prefix ${prefix}:`, mockVinDatabase[prefix]);
        return mockVinDatabase[prefix];
      }
    }
    
    // If no match in mock database, try the edge function
    try {
      console.log("Attempting to use edge function for VIN decoding");
      const { data: decodedData, error } = await supabase.functions.invoke('vin-decoder', {
        body: { vin }
      });

      if (error) {
        console.warn("Edge function error:", error);
      }

      if (decodedData) {
        console.log("Successfully decoded VIN via edge function:", decodedData);
        return decodedData;
      }
    } catch (edgeFunctionError) {
      console.warn("Failed to use edge function, falling back to mock data:", edgeFunctionError);
    }

    // If we get here, VIN wasn't found in any source
    if (vin.startsWith('1FT') || vin.startsWith('1FA') || vin.startsWith('1FM')) {
      return {
        year: "2020",
        make: "ford",
        model: "Unknown Ford Model",
        transmission: "Automatic",
        fuel_type: "Gas",
        body_style: "unknown"
      };
    } else if (vin.startsWith('1G1') || vin.startsWith('2G1') || vin.startsWith('3G1')) {
      return {
        year: "2020", 
        make: "chevrolet",
        model: "Unknown Chevrolet Model",
        transmission: "Automatic",
        fuel_type: "Gas",
        body_style: "unknown"
      };
    } else if (vin.startsWith('JTD') || vin.startsWith('4T1') || vin.startsWith('5TD')) {
      return {
        year: "2020",
        make: "toyota",
        model: "Unknown Toyota Model",
        transmission: "Automatic",
        fuel_type: "Gas",
        body_style: "unknown"
      };
    }
    
    console.log("No VIN match found in any source");
    return null;
    
  } catch (error) {
    console.error('Error decoding VIN:', error);
    return null;
  }
}

/**
 * Fetches vehicle details by ID from the database
 */
export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    toast({
      title: 'Error',
      description: 'Could not fetch vehicle details',
      variant: 'destructive',
    });
    return null;
  }
}

/**
 * Formats vehicle information for display
 */
export function formatVehicleInfo(vehicle: Vehicle | null): string {
  if (!vehicle) return 'Unknown Vehicle';
  
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.color ? ` - ${vehicle.color}` : ''}`;
}

/**
 * Gets descriptive text for vehicle transmission type
 */
export function getTransmissionTypeText(type?: string): string {
  if (!type) return 'Unknown';
  
  const transmissionTypes: Record<string, string> = {
    'automatic': 'Automatic',
    'manual': 'Manual',
    'cvt': 'CVT',
    'auto-manual': 'Automated Manual',
    'dual-clutch': 'Dual Clutch',
  };
  
  return transmissionTypes[type.toLowerCase()] || type;
}

/**
 * Gets descriptive text for vehicle fuel type
 */
export function getFuelTypeText(type?: string): string {
  if (!type) return 'Unknown';
  
  const fuelTypes: Record<string, string> = {
    'gasoline': 'Gasoline',
    'diesel': 'Diesel',
    'electric': 'Electric',
    'hybrid': 'Hybrid',
    'plugin_hybrid': 'Plug-in Hybrid',
    'cng': 'CNG',
    'lpg': 'LPG',
  };
  
  return fuelTypes[type.toLowerCase()] || type;
}
