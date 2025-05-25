
/**
 * VIN Decoder Service - Production Implementation with Enhanced Error Handling
 */
import { VinDecodeResult } from '@/types/vehicle';

export interface VinDecodeError {
  code: 'INVALID_VIN' | 'NETWORK_ERROR' | 'API_ERROR' | 'PARSE_ERROR' | 'SERVICE_UNAVAILABLE';
  message: string;
  recoverable: boolean;
  retryAfter?: number;
}

export class VinDecodingError extends Error {
  constructor(
    public readonly error: VinDecodeError,
    message?: string
  ) {
    super(message || error.message);
    this.name = 'VinDecodingError';
  }
}

/**
 * Validate VIN format before making API call
 */
function validateVin(vin: string): VinDecodeError | null {
  if (!vin) {
    return {
      code: 'INVALID_VIN',
      message: 'VIN is required',
      recoverable: false
    };
  }

  if (vin.length !== 17) {
    return {
      code: 'INVALID_VIN',
      message: `VIN must be exactly 17 characters (current: ${vin.length})`,
      recoverable: false
    };
  }

  // Basic VIN character validation
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!vinRegex.test(vin)) {
    return {
      code: 'INVALID_VIN',
      message: 'VIN contains invalid characters. Use only letters A-Z (excluding I, O, Q) and numbers 0-9',
      recoverable: false
    };
  }

  return null;
}

/**
 * Decode a VIN using NHTSA API with comprehensive error handling
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  console.log('Starting VIN decode for:', vin);

  // Validate VIN format first
  const validationError = validateVin(vin);
  if (validationError) {
    console.error('VIN validation failed:', validationError);
    throw new VinDecodingError(validationError);
  }

  try {
    // Check network connectivity
    if (!navigator.onLine) {
      throw new VinDecodingError({
        code: 'NETWORK_ERROR',
        message: 'No internet connection. Please check your network and try again.',
        recoverable: true,
        retryAfter: 5000
      });
    }

    console.log('Making request to NHTSA API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('NHTSA API request failed:', response.status, response.statusText);
      
      if (response.status >= 500) {
        throw new VinDecodingError({
          code: 'SERVICE_UNAVAILABLE',
          message: 'VIN decoding service is temporarily unavailable. Please try again in a few minutes.',
          recoverable: true,
          retryAfter: 30000
        });
      }

      if (response.status === 429) {
        throw new VinDecodingError({
          code: 'API_ERROR',
          message: 'Too many requests. Please wait a moment and try again.',
          recoverable: true,
          retryAfter: 60000
        });
      }

      throw new VinDecodingError({
        code: 'API_ERROR',
        message: `VIN API request failed with status ${response.status}`,
        recoverable: true,
        retryAfter: 5000
      });
    }

    const data = await response.json();
    console.log('NHTSA API response received:', data);
    
    if (!data.Results || !Array.isArray(data.Results) || data.Results.length === 0) {
      console.warn('No results in NHTSA response');
      throw new VinDecodingError({
        code: 'PARSE_ERROR',
        message: 'VIN not found in database. This VIN may not exist or may not be supported.',
        recoverable: false
      });
    }

    // Extract relevant fields from NHTSA response
    const results = data.Results;
    const getResultValue = (variableName: string) => {
      const result = results.find((r: any) => r.Variable === variableName);
      const value = result?.Value || '';
      return value === 'Not Applicable' || value === '' ? '' : value;
    };

    const make = getResultValue('Make');
    const model = getResultValue('Model');
    const year = getResultValue('Model Year');

    // Validate that we got essential vehicle information
    if (!make && !model && !year) {
      console.warn('No essential vehicle data found in response');
      throw new VinDecodingError({
        code: 'PARSE_ERROR',
        message: 'Could not extract vehicle information from VIN. The VIN may be invalid or not supported.',
        recoverable: false
      });
    }

    const vinDecodeResult: VinDecodeResult = {
      make: make || '',
      model: model || '',
      year: year || '',
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
    console.error('VIN decoding error:', error);
    
    // Handle abort/timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new VinDecodingError({
        code: 'NETWORK_ERROR',
        message: 'Request timed out. Please check your connection and try again.',
        recoverable: true,
        retryAfter: 5000
      });
    }

    // Re-throw our custom errors
    if (error instanceof VinDecodingError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new VinDecodingError({
        code: 'NETWORK_ERROR',
        message: 'Network error occurred. Please check your internet connection.',
        recoverable: true,
        retryAfter: 5000
      });
    }

    // Generic error fallback
    throw new VinDecodingError({
      code: 'API_ERROR',
      message: 'An unexpected error occurred while decoding the VIN. Please try again.',
      recoverable: true,
      retryAfter: 5000
    });
  }
}
