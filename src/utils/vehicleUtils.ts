
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VinDecodeResult, Vehicle } from '@/types/vehicle';

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
      console.log('Found existing vehicle in database:', existingVehicle);
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

    // Query Supabase for vehicle data from our cached VIN database
    console.log('Looking up VIN in vin_lookup table:', vin);
    const { data: vinData, error: vinError } = await supabase
      .from('vin_lookup')
      .select('*')
      .ilike('vin_prefix', vin.substring(0, 8) + '%')
      .limit(1)
      .maybeSingle();

    if (vinError) {
      console.error('Error querying vin_lookup table:', vinError);
    }

    if (vinData) {
      console.log('Found VIN match in vin_lookup table:', vinData);
      return {
        year: vinData.year,
        make: vinData.make,
        model: vinData.model,
        transmission: vinData.transmission,
        transmission_type: vinData.transmission_type,
        drive_type: vinData.drive_type,
        fuel_type: vinData.fuel_type,
        body_style: vinData.body_style,
        country: vinData.country,
        engine: vinData.engine,
        gvwr: vinData.gvwr,
        trim: vinData.trim
      };
    }
    
    // If not found in our database tables, use the local mock database as fallback
    console.log('Using fallback mock VIN decoding database');
    // Import locally to avoid circular dependencies
    const { mockVinDatabase } = await import('@/data/vinDatabase');
    
    const vinPrefix = vin.substring(0, 8).toUpperCase();
    
    for (const prefix in mockVinDatabase) {
      if (vinPrefix.startsWith(prefix)) {
        console.log('Found VIN match in mock database:', prefix);
        return mockVinDatabase[prefix];
      }
    }

    // If we couldn't find in the mock database, log that info
    console.log('VIN not found in any database:', vin);
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
