
import { VinDecodeResult } from '@/types/vehicle';
import { supabase } from '@/integrations/supabase/client';
import { validateVin, getVinValidationError } from './vinDecoder/vinValidator';

/**
 * Main VIN decoding service using Supabase Edge Function
 */
export const decodeVin = async (vin: string): Promise<VinDecodeResult | null> => {
  // Validate VIN format
  const validationError = getVinValidationError(vin);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    console.log('Calling VIN decode Edge Function for:', vin);
    
    // Use Supabase Edge Function to decode VIN (bypasses CORS)
    const { data, error } = await supabase.functions.invoke('decode-vin', {
      body: { vin }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(`VIN decode failed: ${error.message}`);
    }

    if (data && typeof data === 'object') {
      console.log('VIN decode successful via Edge Function:', data);
      return data as VinDecodeResult;
    }

    throw new Error('Invalid response from VIN decode service');

  } catch (error) {
    console.error('VIN decode service error:', error);
    throw error;
  }
};

// Re-export validation utilities for convenience
export { validateVin, formatVin, getVinValidationError } from './vinDecoder/vinValidator';
