
/**
 * VIN Decoder Service - Production Implementation
 * This service integrates with real VIN decoding APIs
 */
import { VinDecodeResult } from '@/types/vehicle';

/**
 * Decode a VIN using NHTSA API (free government service)
 * No mock data fallbacks - returns null if API is unavailable
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  if (!vin || vin.length !== 17) {
    throw new Error('Invalid VIN format. VIN must be 17 characters long.');
  }

  try {
    // Use NHTSA VIN Decoder API (free and reliable)
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );

    if (!response.ok) {
      throw new Error(`VIN API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.Results || data.Results.length === 0) {
      return null;
    }

    // Extract relevant fields from NHTSA response
    const results = data.Results;
    const getResultValue = (variableName: string) => {
      const result = results.find((r: any) => r.Variable === variableName);
      return result?.Value || '';
    };

    const vinDecodeResult: VinDecodeResult = {
      make: getResultValue('Make') || '',
      model: getResultValue('Model') || '',
      year: getResultValue('Model Year') || '',
      body_style: getResultValue('Body Class') || '',
      engine: getResultValue('Engine Model') || '',
      transmission: getResultValue('Transmission Style') || '',
      drive_type: getResultValue('Drive Type') || '',
      fuel_type: getResultValue('Fuel Type - Primary') || '',
      country: getResultValue('Plant Country') || '',
      trim: getResultValue('Trim') || '',
      transmission_type: getResultValue('Transmission Style') || '',
      gvwr: getResultValue('Gross Vehicle Weight Rating') || ''
    };

    console.log('VIN decoded successfully:', vinDecodeResult);
    return vinDecodeResult;
    
  } catch (error) {
    console.error('VIN decoding service error:', error);
    throw new Error('VIN decoding service is currently unavailable. Please try again later.');
  }
}
