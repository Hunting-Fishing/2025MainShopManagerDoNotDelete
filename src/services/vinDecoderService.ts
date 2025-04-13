
import { supabase } from '@/lib/supabase';
import { VinDecodeResult } from '@/types/vehicle';

/**
 * Decode a VIN using the database
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  try {
    if (!vin || vin.length !== 17) {
      console.log('Invalid VIN provided:', vin);
      return null;
    }
    
    console.log('Decoding VIN in service:', vin);
    
    // First try to get the VIN from our vehicles table if we've seen it before
    const { data: existingVehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vin', vin.toUpperCase())
      .maybeSingle();
    
    if (vehicleError) {
      console.error('Error querying vehicles table:', vehicleError);
    }

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
      
    if (vinError) {
      console.error('Error querying vin_lookup table:', vinError);
    }
      
    if (vinData) {
      console.log('Found VIN match in vin_lookup table by 8-char prefix:', vinData);
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
    
    // Try another query using just the first part of the VIN (WMI)
    const { data: wmiData, error: wmiError } = await supabase
      .from('vin_lookup')
      .select('*')
      .eq('vin_prefix', vin.substring(0, 3).toUpperCase())
      .maybeSingle();
      
    if (wmiError) {
      console.error('Error querying vin_lookup table for WMI:', wmiError);
    }
      
    if (wmiData) {
      console.log('Found VIN WMI match in vin_lookup table (first 3 chars):', wmiData);
      return {
        year: wmiData.year,
        make: wmiData.make,
        model: wmiData.model,
        transmission: wmiData.transmission,
        transmission_type: wmiData.transmission_type,
        drive_type: wmiData.drive_type,
        fuel_type: wmiData.fuel_type,
        body_style: wmiData.body_style,
        country: wmiData.country,
        engine: wmiData.engine,
        gvwr: wmiData.gvwr,
        trim: wmiData.trim
      };
    }
    
    // Check if vin_lookup table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('vin_lookup')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('Error checking vin_lookup table:', tableError);
    } else {
      console.log('VIN lookup table status:', tableInfo);
    }
    
    console.log('VIN not found in database:', vin);
    return null;
  } catch (error) {
    console.error('Error in vinDecoderService:', error);
    return null;
  }
}
