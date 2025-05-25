
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
  const maxRetries = 3;
  const baseRetryDelay = 2000;

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
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
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
      
      toast({
        title: "VIN Decoded Successfully",
        description: `Vehicle identified as ${result.year} ${result.make} ${result.model}`,
        variant: "default",
      });

    } catch (error) {
      console.error('VIN decode failed:', error);
      
      // Check if this is still the current VIN being processed
      if (currentVinRef.current !== vin) {
        console.log("VIN decode error ignored - newer request in progress");
        return;
      }
      
      let errorMessage = 'Unknown error occurred';
      let canRetry = false;
      let retryAfter = baseRetryDelay;

      if (error instanceof VinDecodingError) {
        errorMessage = error.error.message;
        canRetry = error.error.recoverable && state.retryCount < maxRetries;
        retryAfter = error.error.retryAfter || baseRetryDelay;
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

      // Show appropriate toast based on error type
      if (error instanceof VinDecodingError) {
        const variant = error.error.recoverable ? "destructive" : "destructive";
        const title = error.error.recoverable ? "VIN Decode Failed" : "Invalid VIN";
        
        toast({
          title,
          description: errorMessage,
          variant,
        });
      } else {
        toast({
          title: "VIN Decode Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

      // Schedule auto-retry if applicable
      if (canRetry && error instanceof VinDecodingError && error.error.recoverable) {
        console.log(`Scheduling retry in ${retryAfter}ms...`);
        timeoutRef.current = setTimeout(() => {
          if (currentVinRef.current === vin) { // Only retry if still the current VIN
            decode(vin, onSuccess, onError);
          }
        }, retryAfter);
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
