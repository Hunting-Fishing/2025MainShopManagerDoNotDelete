
import { useState, useCallback } from 'react';
import { VinDecodeResult } from '@/types/vehicle';
import { decodeVin, VinDecodingError } from '@/services/vinDecoderService';

export interface UseVinDecoderReturn {
  isProcessing: boolean;
  error: string | null;
  canRetry: boolean;
  hasAttempted: boolean;
  decode: (vin: string, onSuccess: (result: VinDecodeResult) => void, onError: (error: string) => void) => Promise<void>;
  retry: (vin: string, onSuccess: (result: VinDecodeResult) => void, onError: (error: string) => void) => void;
  progress: number;
  getCurrentVin: () => string;
}

export const useVinDecoder = (): UseVinDecoderReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentVin, setCurrentVin] = useState('');

  const MAX_RETRIES = 2;
  const RETRY_DELAYS = [2000, 5000]; // 2s, 5s

  const decode = useCallback(async (
    vin: string, 
    onSuccess: (result: VinDecodeResult) => void, 
    onError: (error: string) => void
  ) => {
    if (!vin || vin.length !== 17) {
      onError('VIN must be exactly 17 characters long');
      return;
    }

    console.log(`VIN decode attempt ${retryCount + 1} for VIN: ${vin}`);
    setCurrentVin(vin);
    setIsProcessing(true);
    setError(null);
    setHasAttempted(true);
    setProgress(20);

    try {
      setProgress(50);
      const result = await decodeVin(vin);
      setProgress(100);
      
      console.log('VIN decode successful:', result);
      onSuccess(result);
      
      // Reset state on success
      setRetryCount(0);
      setCanRetry(false);
      setError(null);
    } catch (err) {
      console.error('VIN decode failed:', err);
      setProgress(0);
      
      let errorMessage = 'Failed to decode VIN';
      let shouldAllowRetry = false;

      if (err instanceof VinDecodingError) {
        errorMessage = err.message;
        shouldAllowRetry = err.error.recoverable && retryCount < MAX_RETRIES;
        
        if (err.error.code === 'SERVICE_UNAVAILABLE' || err.error.code === 'NETWORK_ERROR') {
          // For service/network errors, try fallback analysis
          try {
            const fallbackResult: VinDecodeResult = {
              year: getYearFromVin(vin),
              make: getMakeFromWMI(vin.substring(0, 3)),
              model: 'Unknown',
              country: getCountryFromWMI(vin.substring(0, 3))
            };
            
            console.log('Using fallback VIN analysis:', fallbackResult);
            onSuccess(fallbackResult);
            setError('VIN decoded using fallback analysis (limited data available)');
            setCanRetry(false);
            setIsProcessing(false);
            return;
          } catch (fallbackErr) {
            console.error('Fallback analysis failed:', fallbackErr);
          }
        }
      } else {
        shouldAllowRetry = retryCount < MAX_RETRIES;
        errorMessage = err instanceof Error ? err.message : 'Network error occurred. Please check your internet connection.';
      }

      setError(errorMessage);
      setCanRetry(shouldAllowRetry);
      
      if (shouldAllowRetry) {
        const delay = RETRY_DELAYS[retryCount] || 5000;
        console.log(`Scheduling retry in ${delay}ms...`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          decode(vin, onSuccess, onError);
        }, delay);
      } else {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [retryCount]);

  const retry = useCallback((
    vin: string, 
    onSuccess: (result: VinDecodeResult) => void, 
    onError: (error: string) => void
  ) => {
    if (canRetry) {
      setRetryCount(0);
      decode(vin, onSuccess, onError);
    }
  }, [canRetry, decode]);

  const getCurrentVin = useCallback(() => currentVin, [currentVin]);

  return {
    isProcessing,
    error,
    canRetry,
    hasAttempted,
    decode,
    retry,
    progress,
    getCurrentVin
  };
};

// Helper functions for fallback VIN analysis
const getYearFromVin = (vin: string): string => {
  const yearCode = vin.charAt(9);
  const yearMap: { [key: string]: number } = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
    'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
    'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027,
    'W': 2028, 'X': 2029, 'Y': 2030, 'Z': 2031,
    '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
    '6': 2006, '7': 2007, '8': 2008, '9': 2009
  };
  
  return yearMap[yearCode]?.toString() || '';
};

const getMakeFromWMI = (wmi: string): string => {
  const makeMap: { [key: string]: string } = {
    '1G1': 'Chevrolet', '1G6': 'Cadillac', '1GM': 'Pontiac', '1GC': 'Chevrolet',
    '2G1': 'Chevrolet', '2GN': 'Chevrolet', '3G1': 'Chevrolet',
    '1FT': 'Ford', '1FA': 'Ford', '1FB': 'Ford', '1FC': 'Ford', '1FD': 'Ford',
    '1FM': 'Ford', '1FN': 'Ford', '1FU': 'Freightliner', '1FV': 'Freightliner',
    '2FA': 'Ford', '2FB': 'Ford', '2FC': 'Ford', '2FD': 'Ford', '2FM': 'Ford',
    '3FA': 'Ford', '3FB': 'Ford', '3FC': 'Ford', '3FD': 'Ford', '3FM': 'Ford',
    '1HG': 'Honda', '1HT': 'Honda', '2HG': 'Honda', '3HG': 'Honda',
    'JHM': 'Honda', 'JH2': 'Honda', 'JH3': 'Honda', 'JH4': 'Honda',
    '4T1': 'Toyota', '4T3': 'Toyota', '5TD': 'Toyota', '5TF': 'Toyota',
    'JT2': 'Toyota', 'JT3': 'Toyota', 'JT4': 'Toyota', 'JT6': 'Toyota',
    '1N4': 'Nissan', '1N6': 'Nissan', 'JN1': 'Nissan', 'JN6': 'Nissan',
    '1C3': 'Chrysler', '1C4': 'Chrysler', '1C6': 'Chrysler', '1C8': 'Chrysler',
    '2C3': 'Chrysler', '2C4': 'Chrysler', '2C8': 'Chrysler',
    'WBA': 'BMW', 'WBS': 'BMW', 'WBY': 'BMW',
    'WDB': 'Mercedes-Benz', 'WDC': 'Mercedes-Benz', 'WDD': 'Mercedes-Benz',
    'WVW': 'Volkswagen', 'WV1': 'Volkswagen', 'WV2': 'Volkswagen',
    'WAU': 'Audi', 'WA1': 'Audi',
  };
  
  // Try exact match first
  if (makeMap[wmi]) {
    return makeMap[wmi];
  }
  
  // Try partial matches
  for (const [prefix, make] of Object.entries(makeMap)) {
    if (wmi.startsWith(prefix.substring(0, 2))) {
      return make;
    }
  }
  
  return 'Unknown';
};

const getCountryFromWMI = (wmi: string): string => {
  const firstChar = wmi.charAt(0);
  
  if (['1', '4', '5'].includes(firstChar)) return 'United States';
  if (['2'].includes(firstChar)) return 'Canada';
  if (['3'].includes(firstChar)) return 'Mexico';
  if (['J'].includes(firstChar)) return 'Japan';
  if (['K'].includes(firstChar)) return 'South Korea';
  if (['L'].includes(firstChar)) return 'China';
  if (['S'].includes(firstChar)) return 'United Kingdom';
  if (['V'].includes(firstChar)) return 'France';
  if (['W'].includes(firstChar)) return 'Germany';
  if (['Z'].includes(firstChar)) return 'Italy';
  
  return 'Unknown';
};
