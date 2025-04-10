
import { supabase } from '@/lib/supabase';
import { VinDecodeResult, Vehicle } from '@/types/vehicle';

/**
 * Get a vehicle by its ID
 */
export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching vehicle:", error);
      throw new Error('Failed to fetch vehicle data');
    }
    
    return data;
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    return null;
  }
}

/**
 * Decode a Vehicle Identification Number (VIN)
 * Will try to use an external API first, then fall back to local database
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  try {
    // First we'll try to match against our database of VIN prefixes
    // Extract first 8 characters (prefix) of the VIN
    const vinPrefix = vin.substring(0, 8);
    
    // Hard-coded VIN data for simplified example
    // In a real implementation, this would query database records or an external API
    const mockVinData = [
      {
        prefix: 'JM1BL1',
        year: '2018',
        make: 'Mazda',
        model: '3',
        transmission: 'Automatic',
        transmission_type: 'CVT',
        drive_type: 'FWD',
        fuel_type: 'Gasoline',
        body_style: 'Sedan',
        country: 'Japan',
        engine: '2.0L I4',
        gvwr: '4000'
      },
      {
        prefix: '1HGCM',
        year: '2020',
        make: 'Honda',
        model: 'Accord',
        transmission: 'Automatic',
        transmission_type: '8-Speed',
        drive_type: 'FWD',
        fuel_type: 'Gasoline',
        body_style: 'Sedan',
        country: 'USA',
        engine: '1.5L Turbo',
        gvwr: '4300'
      },
      {
        prefix: '5YJSA',
        year: '2022',
        make: 'Tesla',
        model: 'Model S',
        transmission: 'Electric',
        transmission_type: 'Single-Speed',
        drive_type: 'AWD',
        fuel_type: 'Electric',
        body_style: 'Sedan',
        country: 'USA',
        engine: 'Electric',
        gvwr: '5700'
      }
    ];
    
    // Try to find a matching VIN prefix in our mock data
    const match = mockVinData.find(v => vinPrefix.startsWith(v.prefix));
    
    if (match) {
      return {
        year: match.year,
        make: match.make,
        model: match.model,
        transmission: match.transmission,
        transmission_type: match.transmission_type,
        drive_type: match.drive_type,
        fuel_type: match.fuel_type,
        body_style: match.body_style,
        country: match.country,
        engine: match.engine,
        gvwr: match.gvwr
      };
    }

    // In a real implementation, if no local match is found, call an external API
    console.log("No VIN match found in database, would call external API");
    return null;
  } catch (error) {
    console.error("Error in VIN decoding:", error);
    return null;
  }
}
