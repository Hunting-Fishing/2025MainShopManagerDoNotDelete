
import { supabase } from '@/lib/supabase';
import { VinDecodeResult } from '@/types/vehicle';

/**
 * Decode a Vehicle Identification Number (VIN) 
 * Will try to use an external API first, then fall back to local database
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  // First we'll try to match against our database of VIN prefixes
  try {
    // Extract first 8 characters (prefix) of the VIN
    const vinPrefix = vin.substring(0, 8);
    
    const { data, error } = await supabase
      .from('vin_prefixes')
      .select('*')
      .ilike('prefix', `${vinPrefix}%`)
      .limit(1);
    
    if (error) {
      console.error("Error querying VIN database:", error);
    } else if (data && data.length > 0) {
      console.log("VIN match found in database:", data[0]);
      // Return the decoded info from our database
      return {
        year: data[0].year,
        make: data[0].make,
        model: data[0].model,
        transmission: data[0].transmission,
        transmission_type: data[0].transmission_type,
        drive_type: data[0].drive_type,
        fuel_type: data[0].fuel_type,
        body_style: data[0].body_style,
        country: data[0].country,
        engine: data[0].engine,
        gvwr: data[0].gvwr,
        valid: true
      };
    }

    // If no match in database, attempt to call external API
    // This would be where you call a real VIN decoder API
    // For now we'll return null to indicate no match found
    return null;
  } catch (error) {
    console.error("Error in VIN decoding:", error);
    return null;
  }
}
