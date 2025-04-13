import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VinDecodeResult, Vehicle } from '@/types/vehicle';
import { decodeVin as decodeVinService } from '@/services/vinDecoderService';

/**
 * Decode a Vehicle Identification Number (VIN) to get vehicle details
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  try {
    console.log('Decoding VIN in utils:', vin);
    return await decodeVinService(vin);
  } catch (error) {
    console.error('Error decoding VIN in utils:', error);
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
