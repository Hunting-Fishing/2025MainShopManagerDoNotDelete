
import { useState } from 'react';
import { VinDecodeResult } from '@/types/vehicle';
import { decodeVin as apiDecodeVin } from '@/services/vinDecoderService';

export interface UseVinDecoderReturn {
  decode: (vin: string) => Promise<VinDecodeResult | null>;
  isDecoding: boolean;
  error: string | null;
  canRetry: boolean;
  hasAttempted: boolean;
  retry: () => void;
}

export const useVinDecoder = (): UseVinDecoderReturn => {
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [lastVin, setLastVin] = useState<string>('');

  const decode = async (vin: string): Promise<VinDecodeResult | null> => {
    if (!vin || vin.length !== 17) {
      setError('VIN must be exactly 17 characters');
      return null;
    }

    setIsDecoding(true);
    setError(null);
    setHasAttempted(true);
    setLastVin(vin);

    try {
      console.log('Starting VIN decode process for:', vin);
      
      // Use the service directly instead of going through utils
      const result = await apiDecodeVin(vin);
      
      if (result) {
        console.log('VIN decode successful:', result);
        setError(null);
        return result;
      } else {
        setError('Failed to decode VIN');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'VIN decode failed';
      console.error('VIN decode error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsDecoding(false);
    }
  };

  const retry = () => {
    if (lastVin) {
      decode(lastVin);
    }
  };

  return {
    decode,
    isDecoding,
    error,
    canRetry: !!error && !!lastVin,
    hasAttempted,
    retry
  };
};
