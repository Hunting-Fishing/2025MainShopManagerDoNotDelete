
import { VinDecodeResult } from '@/types/vehicle';
import { decodeVinWithNHTSA } from './vinDecoder/nhtsaApi';
import { performFallbackVinAnalysis } from './vinDecoder/fallbackAnalysis';
import { validateVin, getVinValidationError } from './vinDecoder/vinValidator';

/**
 * Main VIN decoding service with API fallback
 */
export const decodeVin = async (vin: string): Promise<VinDecodeResult | null> => {
  // Validate VIN format
  const validationError = getVinValidationError(vin);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    // Try NHTSA API first
    return await decodeVinWithNHTSA(vin);
  } catch (error) {
    console.error('NHTSA API failed, using fallback analysis:', error);
    
    try {
      return performFallbackVinAnalysis(vin);
    } catch (fallbackError) {
      console.error('Fallback VIN analysis failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// Re-export validation utilities for convenience
export { validateVin, formatVin, getVinValidationError } from './vinDecoder/vinValidator';
