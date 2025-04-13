
import { supabase } from '@/lib/supabase';
import { VinDecodeResult } from '@/types/vehicle';

/**
 * Decode a VIN using the database
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  try {
    // First try to get the VIN from our vehicles table if we've seen it before
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vin', vin)
      .maybeSingle();

    if (existingVehicle) {
      console.log('Found existing vehicle in vehicles table:', existingVehicle);
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

    // If not found in vehicles, try the dedicated VIN lookup table by prefix
    const { data: vinData, error: vinError } = await supabase
      .from('vin_lookup')
      .select('*')
      .eq('vin_prefix', vin.substring(0, 8).toUpperCase())
      .maybeSingle();
      
    if (vinData && !vinError) {
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
    
    console.log('VIN not found in database:', vin);
    return null;
  } catch (error) {
    console.error('Error in vinDecoderService:', error);
    return null;
  }
}
