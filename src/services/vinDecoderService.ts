
import { mockVinDatabase } from '@/data/vinDatabase';
import { VinDecodeResult } from '@/types/vehicle';

/**
 * Decode a VIN using the mock database (fallback when API is unavailable)
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  // For testing and fallback purposes, we'll check if the VIN prefix matches any in our mock database
  const vinPrefix = vin.substring(0, 8).toUpperCase();
  
  for (const prefix in mockVinDatabase) {
    if (vinPrefix.startsWith(prefix)) {
      return mockVinDatabase[prefix];
    }
  }
  
  // Return null if no match found
  return null;
}
