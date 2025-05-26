
import { useState, useRef, useCallback } from 'react';
import { decodeVin, VinDecodingError } from '@/services/vinDecoderService';
import { VinDecodeResult } from '@/types/vehicle';
import { toast } from '@/hooks/use-toast';

export interface VinDecoderState {
  isProcessing: boolean;
  error: string | null;
  canRetry: boolean;
  retryCount: number;
  lastAttempt: number | null;
  hasAttempted: boolean;
}

export const useVinDecoder = () => {
  const [state, setState] = useState<VinDecoderState>({
    isProcessing: false,
    error: null,
    canRetry: false,
    retryCount: 0,
    lastAttempt: null,
    hasAttempted: false
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentVinRef = useRef<string>('');
  const maxRetries = 1; // Reduced to 1 retry due to consistent CORS issues
  const baseRetryDelay = 2000; // Reduced delay

  const clearState = useCallback(() => {
    setState({
      isProcessing: false,
      error: null,
      canRetry: false,
      retryCount: 0,
      lastAttempt: null,
      hasAttempted: false
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    currentVinRef.current = '';
  }, []);

  const validateVin = useCallback((vin: string): string | null => {
    if (!vin) return 'VIN is required';
    if (vin.length !== 17) return `VIN must be 17 characters (current: ${vin.length})`;
    
    // Basic VIN validation - no I, O, Q allowed
    const invalidChars = /[IOQ]/i;
    if (invalidChars.test(vin)) {
      return 'VIN contains invalid characters (I, O, Q are not allowed)';
    }
    
    return null;
  }, []);

  const getBasicVinInfo = useCallback((vin: string): VinDecodeResult | null => {
    // Extract basic info from VIN structure when API fails
    try {
      const year = getModelYear(vin.charAt(9));
      const countryCode = vin.substring(0, 2);
      const manufacturer = getManufacturerFromVin(vin.substring(0, 3));
      
      if (year && manufacturer) {
        return {
          year: year.toString(),
          make: manufacturer,
          model: 'Unknown',
          vin: vin,
          country: getCountryFromCode(countryCode),
          transmission: '',
          drive_type: '',
          fuel_type: '',
          engine: '',
          body_style: ''
        };
      }
    } catch (error) {
      console.log('Could not extract basic VIN info:', error);
    }
    
    return null;
  }, []);

  const decode = useCallback(async (
    vin: string,
    onSuccess: (result: VinDecodeResult) => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    // Prevent duplicate calls for the same VIN
    if (currentVinRef.current === vin && state.isProcessing) {
      console.log("VIN decode already in progress for:", vin);
      return;
    }

    // Clear any existing timeout or abort controller
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Validate VIN
    const validationError = validateVin(vin);
    if (validationError) {
      setState(prev => ({ 
        ...prev, 
        error: validationError, 
        canRetry: false,
        hasAttempted: true 
      }));
      onError?.(validationError);
      return;
    }

    currentVinRef.current = vin;
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null,
      lastAttempt: Date.now(),
      hasAttempted: true
    }));

    try {
      console.log(`VIN decode attempt ${state.retryCount + 1} for VIN: ${vin}`);
      
      const result = await decodeVin(vin);
      
      // Check if this is still the current VIN being processed
      if (currentVinRef.current !== vin) {
        console.log("VIN decode result ignored - newer request in progress");
        return;
      }
      
      // Success
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: null,
        retryCount: 0,
        canRetry: false
      }));

      onSuccess(result);
      
      // Show appropriate success message
      if (result.make === 'Unknown' || result.model === 'Unknown') {
        toast({
          title: "VIN Partially Decoded",
          description: `Basic vehicle information extracted. Year: ${result.year}, Make: ${result.make}`,
          variant: "default",
        });
      } else {
        toast({
          title: "VIN Decoded Successfully",
          description: `Vehicle identified as ${result.year} ${result.make} ${result.model}`,
          variant: "default",
        });
      }

    } catch (error) {
      console.error('VIN decode failed:', error);
      
      // Check if this is still the current VIN being processed
      if (currentVinRef.current !== vin) {
        console.log("VIN decode error ignored - newer request in progress");
        return;
      }
      
      let errorMessage = 'VIN decoding service unavailable';
      let canRetry = false;
      let shouldShowFallback = false;

      if (error instanceof VinDecodingError) {
        errorMessage = error.error.message;
        canRetry = error.error.recoverable && state.retryCount < maxRetries;
        
        // For network errors, try fallback
        if (error.error.code === 'NETWORK_ERROR' || error.error.code === 'CORS_ERROR') {
          shouldShowFallback = true;
          errorMessage = 'VIN service unavailable - using basic VIN analysis';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        canRetry = state.retryCount < maxRetries;
        shouldShowFallback = true;
      }

      // Try fallback for basic VIN info
      if (shouldShowFallback) {
        const basicInfo = getBasicVinInfo(vin);
        if (basicInfo) {
          setState(prev => ({ 
            ...prev, 
            isProcessing: false, 
            error: null,
            retryCount: 0,
            canRetry: false
          }));
          
          onSuccess(basicInfo);
          
          toast({
            title: "VIN Partially Decoded",
            description: "External service unavailable. Basic info extracted from VIN structure.",
            variant: "default",
          });
          
          return;
        }
      }

      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage,
        canRetry,
        retryCount: prev.retryCount + 1
      }));

      onError?.(errorMessage);

      // Show toast for errors
      toast({
        title: "VIN Decode Failed",
        description: canRetry ? "Will retry automatically..." : "Please enter vehicle details manually.",
        variant: "destructive",
      });

      // Auto-retry only for network errors and if retries available
      if (canRetry && (error instanceof VinDecodingError && error.error.recoverable)) {
        console.log(`Scheduling retry in ${baseRetryDelay}ms...`);
        timeoutRef.current = setTimeout(() => {
          if (currentVinRef.current === vin) {
            decode(vin, onSuccess, onError);
          }
        }, baseRetryDelay);
      }
    }
  }, [state.retryCount, baseRetryDelay, maxRetries, validateVin, getBasicVinInfo]);

  const retry = useCallback((vin: string, onSuccess: (result: VinDecodeResult) => void, onError?: (error: string) => void) => {
    if (!state.canRetry) return;
    
    setState(prev => ({ ...prev, retryCount: 0 }));
    currentVinRef.current = '';
    decode(vin, onSuccess, onError);
  }, [state.canRetry, decode]);

  return {
    ...state,
    decode,
    retry,
    clearState
  };
};

// Helper functions for basic VIN analysis
function getModelYear(yearCode: string): number | null {
  const yearCodes: Record<string, number> = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
    'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
    'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027,
    'W': 2028, 'X': 2029, 'Y': 2030, '1': 2001, '2': 2002, '3': 2003,
    '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009
  };
  
  return yearCodes[yearCode.toUpperCase()] || null;
}

function getManufacturerFromVin(wmi: string): string {
  const manufacturers: Record<string, string> = {
    '1G1': 'Chevrolet', '1G6': 'Cadillac', '1GM': 'Pontiac', '1GC': 'Chevrolet',
    '2G1': 'Chevrolet', '2GN': 'Chevrolet', '3G1': 'Chevrolet', '3GN': 'Chevrolet',
    '1FA': 'Ford', '1FD': 'Ford', '1FM': 'Ford', '1FT': 'Ford',
    '2FA': 'Ford', '3FA': 'Ford', '1ZV': 'Ford',
    'WBA': 'BMW', 'WBS': 'BMW', 'WBY': 'BMW',
    'JH4': 'Acura', 'JHM': 'Honda', '1HG': 'Honda', '2HG': 'Honda', '3HG': 'Honda',
    'KM8': 'Hyundai', 'KNE': 'Hyundai', 'KNA': 'Kia',
    'JN1': 'Nissan', 'JN8': 'Nissan', '1N4': 'Nissan', '1N6': 'Nissan',
    'JT': 'Toyota', '4T1': 'Toyota', '5Y2': 'Toyota'
  };
  
  // Try exact match first
  if (manufacturers[wmi]) {
    return manufacturers[wmi];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(manufacturers)) {
    if (wmi.startsWith(key.substring(0, 2))) {
      return value;
    }
  }
  
  return 'Unknown';
}

function getCountryFromCode(countryCode: string): string {
  const countryCodes: Record<string, string> = {
    '1': 'United States', '2': 'Canada', '3': 'Mexico',
    'J': 'Japan', 'K': 'South Korea', 'L': 'China',
    'W': 'Germany', 'S': 'United Kingdom', 'V': 'France',
    'Y': 'Sweden', 'Z': 'Italy'
  };
  
  return countryCodes[countryCode.charAt(0)] || 'Unknown';
}
