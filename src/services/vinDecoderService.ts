
import { VinDecodeResult } from '@/types/vehicle';
import { supabase } from '@/lib/supabase';

/**
 * Decode a VIN number using a real external API service
 * @param vin Vehicle Identification Number
 * @returns Decoded vehicle information or null if unsuccessful
 */
export const decodeVin = async (vin: string): Promise<VinDecodeResult | null> => {
  try {
    // Validate VIN format
    if (!vin || vin.length !== 17) {
      console.error('Invalid VIN format');
      return null;
    }

    // First check if we have previously decoded this VIN in our database
    const { data: existingVehicleData, error: existingVehicleError } = await supabase
      .from('vehicles')
      .select('make, model, year, vin, trim, transmission, transmission_type, drive_type, fuel_type, engine, body_style, country, gvwr')
      .eq('vin', vin)
      .maybeSingle();

    if (existingVehicleData && !existingVehicleError) {
      console.log('Found existing VIN data in database');
      // Return data from our database
      return {
        year: existingVehicleData.year ? existingVehicleData.year.toString() : '',
        make: existingVehicleData.make || '',
        model: existingVehicleData.model || '',
        trim: existingVehicleData.trim || '',
        drive_type: existingVehicleData.drive_type || '',
        fuel_type: existingVehicleData.fuel_type || '',
        transmission: existingVehicleData.transmission || '',
        transmission_type: existingVehicleData.transmission_type || '',
        body_style: existingVehicleData.body_style || '',
        country: existingVehicleData.country || '',
        engine: existingVehicleData.engine || '',
        gvwr: existingVehicleData.gvwr || '',
      };
    }

    // Make API call to external VIN decoder service
    // Replace this with your actual VIN decoder API integration
    const apiUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.Results || !Array.isArray(data.Results)) {
      console.error('Invalid API response format');
      return null;
    }

    // Process NHTSA API response
    const results = data.Results;
    const vehicleInfo: VinDecodeResult = {
      year: '',
      make: '',
      model: '',
      trim: '',
      drive_type: '',
      fuel_type: '',
      transmission: '',
      transmission_type: '',
      body_style: '',
      country: '',
      engine: '',
      gvwr: '',
    };

    // Map NHTSA fields to our vehicle info structure
    results.forEach((item: any) => {
      if (item.Value && item.Value !== 'Not Applicable') {
        switch (item.Variable) {
          case 'Model Year':
            vehicleInfo.year = item.Value;
            break;
          case 'Make':
            vehicleInfo.make = item.Value;
            break;
          case 'Model':
            vehicleInfo.model = item.Value;
            break;
          case 'Trim':
            vehicleInfo.trim = item.Value;
            break;
          case 'Drive Type':
            vehicleInfo.drive_type = item.Value;
            break;
          case 'Fuel Type - Primary':
            vehicleInfo.fuel_type = item.Value;
            break;
          case 'Transmission Style':
            vehicleInfo.transmission = item.Value;
            break;
          case 'Transmission Speed':
            vehicleInfo.transmission_type = item.Value ? `${item.Value}-Speed` : '';
            break;
          case 'Body Class':
            vehicleInfo.body_style = item.Value;
            break;
          case 'Plant Country':
            vehicleInfo.country = item.Value;
            break;
          case 'Engine Number of Cylinders':
            vehicleInfo.engine = item.Value ? `${item.Value}-cylinder` : '';
            break;
          case 'Gross Vehicle Weight Rating From':
            vehicleInfo.gvwr = item.Value;
            break;
        }
      }
    });

    console.log('API decoded VIN data:', vehicleInfo);
    return vehicleInfo;
  } catch (error) {
    console.error('Error in VIN decoding:', error);
    return null;
  }
};
