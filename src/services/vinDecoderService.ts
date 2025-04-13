
import { supabase } from '@/lib/supabase';
import { VinDecodeResult } from '@/types/vehicle';

/**
 * Decode a VIN using internal database and NHTSA API as fallback
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
    
    // If no internal match found, use NHTSA API as fallback
    return await decodeVinUsingNHTSA(vin);
  } catch (error) {
    console.error('Error in vinDecoderService:', error);
    return null;
  }
}

/**
 * Decode a VIN using the NHTSA API
 */
async function decodeVinUsingNHTSA(vin: string): Promise<VinDecodeResult | null> {
  try {
    console.log('Attempting to decode VIN using NHTSA API:', vin);
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.Results || !Array.isArray(data.Results)) {
      console.error('Invalid response from NHTSA API:', data);
      return null;
    }
    
    // Map NHTSA data to our format
    const result = mapNHTSADataToVehicle(data.Results);
    console.log('NHTSA API decoded vehicle:', result);
    
    // Add to our local database for future reference
    if (result && result.make && result.model) {
      await saveDecodedVehicleToDatabase(vin, result);
    }
    
    return result;
  } catch (error) {
    console.error('Error decoding VIN with NHTSA API:', error);
    return null;
  }
}

/**
 * Map NHTSA API response to our vehicle format
 */
function mapNHTSADataToVehicle(results: any[]): VinDecodeResult | null {
  try {
    // Helper function to find value in NHTSA results
    const findValue = (variable: string): string => {
      const item = results.find(r => r.Variable === variable);
      return item ? item.Value : '';
    };
    
    // Extract year with fallback to model year if available
    let year = findValue('Model Year');
    if (!year) {
      year = findValue('ModelYear');
    }
    
    // Extract make and model
    const make = findValue('Make');
    const model = findValue('Model');
    
    // If we don't have the basic information, return null
    if (!year || !make || !model || year === 'null' || make === 'null' || model === 'null') {
      console.log('Incomplete basic vehicle data from NHTSA');
      return null;
    }
    
    // Create vehicle object with all available information
    const vehicle: VinDecodeResult = {
      year,
      make,
      model,
      trim: findValue('Trim'),
      body_style: findValue('Body Class').toLowerCase(),
      engine: findValue('Engine Model'),
      transmission_type: findValue('Transmission Style')?.toLowerCase(),
      drive_type: findValue('Drive Type'),
      fuel_type: findValue('Fuel Type - Primary')?.toLowerCase(),
      country: findValue('Plant Country'),
      gvwr: findValue('GVWR')
    };
    
    return vehicle;
  } catch (error) {
    console.error('Error mapping NHTSA data:', error);
    return null;
  }
}

/**
 * Save decoded vehicle data to our local database
 */
async function saveDecodedVehicleToDatabase(vin: string, vehicle: VinDecodeResult): Promise<void> {
  try {
    // Try to save to vin_lookup table for future lookups
    const vinPrefix = vin.substring(0, 8).toUpperCase();
    
    const { error } = await supabase
      .from('vin_lookup')
      .upsert([{
        vin_prefix: vinPrefix,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        transmission: vehicle.transmission,
        transmission_type: vehicle.transmission_type,
        drive_type: vehicle.drive_type,
        fuel_type: vehicle.fuel_type,
        body_style: vehicle.body_style,
        country: vehicle.country,
        engine: vehicle.engine,
        gvwr: vehicle.gvwr,
        trim: vehicle.trim,
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Failed to save VIN data to database:', error);
    } else {
      console.log('Successfully saved VIN data to database');
    }
  } catch (error) {
    console.error('Error saving decoded vehicle to database:', error);
  }
}

