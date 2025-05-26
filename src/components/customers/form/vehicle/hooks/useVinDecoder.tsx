
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
}

export const useVinDecoder = () => {
  const [state, setState] = useState<VinDecoderState>({
    isProcessing: false,
    error: null,
    canRetry: false,
    retryCount: 0,
    lastAttempt: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentVinRef = useRef<string>('');
  const maxRetries = 2; // Reduced retry attempts
  const baseRetryDelay = 3000; // Reduced delay

  const clearState = useCallback(() => {
    setState({
      isProcessing: false,
      error: null,
      canRetry: false,
      retryCount: 0,
      lastAttempt: null
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

    if (!vin || vin.length !== 17) {
      const errorMsg = !vin ? 'VIN is required' : `VIN must be 17 characters (current: ${vin.length})`;
      setState(prev => ({ ...prev, error: errorMsg, canRetry: false }));
      onError?.(errorMsg);
      return;
    }

    currentVinRef.current = vin;
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null,
      lastAttempt: Date.now()
    }));

    try {
      console.log(`VIN decode attempt ${state.retryCount + 1} for VIN: ${vin}`);
      
      const result = await decodeVin(vin);
      
      // Check if this is still the current VIN being processed
      if (currentVinRef.current !== vin) {
        console.log("VIN decode result ignored - newer request in progress");
        return;
      }
      
      // Success - even if it's fallback data
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
          description: `Basic vehicle information extracted from VIN. Year: ${result.year}, Make: ${result.make}`,
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
      
      let errorMessage = 'VIN decoding failed';
      let canRetry = false;

      if (error instanceof VinDecodingError) {
        errorMessage = error.error.message;
        canRetry = error.error.recoverable && state.retryCount < maxRetries;
      } else if (error instanceof Error) {
        errorMessage = error.message;
        canRetry = state.retryCount < maxRetries;
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
        title: "VIN Decode Error",
        description: "Please enter vehicle details manually.",
        variant: "destructive",
      });

      // Only auto-retry for network/CORS errors
      if (canRetry && error instanceof VinDecodingError && error.error.recoverable) {
        console.log(`Scheduling retry in ${baseRetryDelay}ms...`);
        timeoutRef.current = setTimeout(() => {
          if (currentVinRef.current === vin) { // Only retry if still the current VIN
            decode(vin, onSuccess, onError);
          }
        }, baseRetryDelay);
      }
    }
  }, [state.retryCount, baseRetryDelay, maxRetries]);

  const retry = useCallback((vin: string, onSuccess: (result: VinDecodeResult) => void, onError?: (error: string) => void) => {
    if (!state.canRetry) return;
    currentVinRef.current = ''; // Reset to allow retry
    decode(vin, onSuccess, onError);
  }, [state.canRetry, decode]);

  return {
    ...state,
    decode,
    retry,
    clearState
  };
};
