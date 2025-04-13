import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VinDecodeResult, Vehicle, CarMake, CarModel } from '@/types/vehicle';
import { mockVinDatabase } from '@/data/vinDatabase';

/**
 * Decode a Vehicle Identification Number (VIN) to get vehicle details
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  try {
    // First try to get the VIN from our database if we've seen it before
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vin', vin)
      .maybeSingle();

    if (existingVehicle) {
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

    // Use the fallback VIN decoding database since Edge Function is failing
    console.log('Using fallback VIN decoding database');
    const vinPrefix = vin.substring(0, 8).toUpperCase();
    
    for (const prefix in mockVinDatabase) {
      if (vinPrefix.startsWith(prefix)) {
        return mockVinDatabase[prefix];
      }
    }

    // If we couldn't find in the mock database, log that info
    console.log('VIN not found in fallback database:', vin);
    return null;
    
  } catch (error) {
    console.error('Error decoding VIN:', error);
    // Don't show toast here, let the component handle it
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
