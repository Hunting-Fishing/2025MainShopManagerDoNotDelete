
/**
 * VIN Decoder Service - Enhanced Implementation with Comprehensive NHTSA Field Mapping
 */
import { VinDecodeResult } from '@/types/vehicle';

export interface VinDecodeError {
  code: 'INVALID_VIN' | 'NETWORK_ERROR' | 'API_ERROR' | 'PARSE_ERROR' | 'SERVICE_UNAVAILABLE' | 'NO_DATA';
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

// NHTSA API Response Interface
interface NHTSAVariable {
  Variable: string;
  Value: string;
  ValueId: string;
}

interface NHTSAResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAVariable[];
}

/**
 * Enhanced field mapping based on NHTSA API response structure
 */
const NHTSA_FIELD_MAPPING = {
  // Basic vehicle info
  'Make': 'make',
  'Model': 'model',
  'Model Year': 'year',
  
  // Body and style
  'Body Class': 'body_style',
  'Vehicle Type': 'vehicle_type',
  'Body Style': 'body_style',
  
  // Engine and performance
  'Engine Model': 'engine',
  'Engine Number of Cylinders': 'engine_cylinders',
  'Engine Configuration': 'engine_configuration',
  'Displacement (L)': 'engine_displacement',
  'Displacement (CI)': 'engine_displacement_ci',
  'Fuel Type - Primary': 'fuel_type',
  'Engine Power (kW)': 'engine_power_kw',
  
  // Transmission and drivetrain
  'Transmission Style': 'transmission',
  'Transmission Speeds': 'transmission_speeds',
  'Drive Type': 'drive_type',
  
  // Manufacturing info
  'Manufacturer Name': 'manufacturer',
  'Plant Country': 'country',
  'Plant Company Name': 'plant_company',
  'Plant City': 'plant_city',
  'Plant State': 'plant_state',
  
  // Technical specifications
  'Gross Vehicle Weight Rating From': 'gvwr',
  'Curb Weight (pounds)': 'curb_weight',
  'Wheelbase (inches)': 'wheelbase',
  'Track Width (inches)': 'track_width',
  'Overall Length (feet)': 'overall_length',
  'Overall Width (feet)': 'overall_width',
  'Overall Height (feet)': 'overall_height',
  
  // Trim and series
  'Trim': 'trim',
  'Series': 'series',
  'Trim2': 'trim_secondary',
  
  // Safety and equipment
  'Electronic Stability Control (ESC)': 'esc',
  'Anti-lock Braking System (ABS)': 'abs',
  'Airbag Locations': 'airbag_locations',
  'Number of Seats': 'seat_count',
  'Number of Seat Rows': 'seat_rows',
  
  // Additional details
  'Error Code': 'error_code',
  'Error Text': 'error_text',
  'Possible Values': 'possible_values'
};

/**
 * Get value from NHTSA results by variable name
 */
function getNHTSAValue(results: NHTSAVariable[], variableName: string): string {
  const result = results.find((r: NHTSAVariable) => r.Variable === variableName);
  const value = result?.Value || '';
  
  // Filter out common "no data" responses
  if (!value || 
      value === 'Not Applicable' || 
      value === '' || 
      value === 'N/A' ||
      value === 'null' ||
      value.toLowerCase() === 'not applicable') {
    return '';
  }
  
  return value.trim();
}

/**
 * Clean and format specific field values
 */
function formatFieldValue(field: string, value: string): string {
  if (!value) return '';
  
  switch (field) {
    case 'year':
      // Ensure year is a 4-digit number
      const yearMatch = value.match(/\d{4}/);
      return yearMatch ? yearMatch[0] : value;
      
    case 'make':
    case 'model':
    case 'manufacturer':
      // Capitalize properly
      return value.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
        
    case 'engine_displacement':
      // Format displacement with units
      if (value.includes('L') || value.includes('l')) return value;
      return value + ' L';
      
    case 'gvwr':
      // Format GVWR with units
      if (value.includes('lbs') || value.includes('pounds')) return value;
      return value + ' lbs';
      
    case 'fuel_type':
      // Standardize fuel type names
      const fuelMap: { [key: string]: string } = {
        'Gasoline': 'Gasoline',
        'Diesel': 'Diesel',
        'Electric': 'Electric',
        'Hybrid': 'Hybrid',
        'Flex Fuel': 'Flex-Fuel'
      };
      return fuelMap[value] || value;
      
    case 'drive_type':
      // Standardize drive type names
      const driveMap: { [key: string]: string } = {
        'Front Wheel Drive': 'FWD',
        'Rear Wheel Drive': 'RWD',
        'All Wheel Drive': 'AWD',
        '4WD/4-Wheel Drive/4x4': '4WD'
      };
      return driveMap[value] || value;
      
    default:
      return value;
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

  // Enhanced VIN character validation
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
 * Enhanced VIN decoder using NHTSA API with comprehensive field mapping
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  console.log('Starting enhanced VIN decode for:', vin);

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

    console.log('Making enhanced request to NHTSA API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

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

    const data: NHTSAResponse = await response.json();
    console.log('Enhanced NHTSA API response received:', data);
    
    if (!data.Results || !Array.isArray(data.Results) || data.Results.length === 0) {
      console.warn('No results in NHTSA response');
      throw new VinDecodingError({
        code: 'NO_DATA',
        message: 'No vehicle data found for this VIN. The VIN may not exist in the database.',
        recoverable: false
      });
    }

    // Extract and map all available fields from NHTSA response
    const results = data.Results;
    
    // Get essential vehicle information
    const make = formatFieldValue('make', getNHTSAValue(results, 'Make'));
    const model = formatFieldValue('model', getNHTSAValue(results, 'Model'));
    const year = formatFieldValue('year', getNHTSAValue(results, 'Model Year'));

    // Check for error indicators in the response
    const errorCode = getNHTSAValue(results, 'Error Code');
    const errorText = getNHTSAValue(results, 'Error Text');
    
    if (errorCode && errorCode !== '0') {
      console.warn('NHTSA API returned error:', errorCode, errorText);
      throw new VinDecodingError({
        code: 'PARSE_ERROR',
        message: errorText || 'Invalid VIN or VIN not found in database',
        recoverable: false
      });
    }

    // Validate that we got essential vehicle information
    if (!make && !model && !year) {
      console.warn('No essential vehicle data found in response');
      throw new VinDecodingError({
        code: 'NO_DATA',
        message: 'Could not extract vehicle information from VIN. The VIN may be incomplete or invalid.',
        recoverable: false
      });
    }

    // Build comprehensive vehicle result with all available fields
    const vinDecodeResult: VinDecodeResult = {
      // Essential info
      make: make || '',
      model: model || '',
      year: year || '',
      
      // Body and style
      body_style: formatFieldValue('body_style', getNHTSAValue(results, 'Body Class')) || '',
      
      // Engine info
      engine: formatFieldValue('engine', getNHTSAValue(results, 'Engine Model')) || '',
      
      // Transmission and drivetrain
      transmission: formatFieldValue('transmission', getNHTSAValue(results, 'Transmission Style')) || '',
      transmission_type: formatFieldValue('transmission', getNHTSAValue(results, 'Transmission Style')) || '',
      drive_type: formatFieldValue('drive_type', getNHTSAValue(results, 'Drive Type')) || '',
      
      // Fuel and performance
      fuel_type: formatFieldValue('fuel_type', getNHTSAValue(results, 'Fuel Type - Primary')) || '',
      
      // Manufacturing
      country: formatFieldValue('country', getNHTSAValue(results, 'Plant Country')) || '',
      
      // Trim and specifications
      trim: formatFieldValue('trim', getNHTSAValue(results, 'Trim')) || '',
      gvwr: formatFieldValue('gvwr', getNHTSAValue(results, 'Gross Vehicle Weight Rating From')) || ''
    };

    console.log('Enhanced VIN decoded successfully:', vinDecodeResult);
    return vinDecodeResult;
    
  } catch (error) {
    console.error('Enhanced VIN decoding error:', error);
    
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
