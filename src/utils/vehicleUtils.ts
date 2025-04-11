import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VinDecodeResult, Vehicle, CarMake, CarModel } from '@/types/vehicle';

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

    // If not in our database, use the VIN decoder service
    const { data: decodedData, error } = await supabase.functions.invoke('vin-decoder', {
      body: { vin }
    });

    if (error) {
      throw new Error(`VIN decoding error: ${error.message}`);
    }

    if (decodedData) {
      return decodedData;
    }

    // Fall back to the vinDecoderService if Supabase function fails
    const fallbackData = await import('@/services/vinDecoderService').then(module => module.decodeVin(vin));
    return fallbackData;
    
  } catch (error) {
    console.error('Error decoding VIN:', error);
    toast({
      title: 'Error',
      description: 'Could not decode VIN. Please check the number and try again.',
      variant: 'destructive',
    });
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
