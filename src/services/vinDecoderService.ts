
import { VinDecodeResult } from '@/types/vehicle';

export class VinDecodingError extends Error {
  public error: {
    code: string;
    message: string;
    recoverable: boolean;
    retryAfter?: number;
  };

  constructor(message: string, code: string, recoverable: boolean = true, retryAfter?: number) {
    super(message);
    this.name = 'VinDecodingError';
    this.error = {
      code,
      message,
      recoverable,
      retryAfter
    };
  }
}

// Enhanced VIN decoding with multiple fallback strategies
export const decodeVin = async (vin: string): Promise<VinDecodeResult> => {
  if (!vin || vin.length !== 17) {
    throw new VinDecodingError('Invalid VIN format. VIN must be 17 characters long.', 'INVALID_VIN', false);
  }

  console.log(`Starting enhanced VIN decode for: ${vin}`);

  try {
    // Try NHTSA API first
    console.log('Making enhanced request to NHTSA API...');
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      const result = parseNHTSAResponse(data.Results);
      console.log('NHTSA VIN decode successful:', result);
      return result;
    } else {
      throw new Error('No results from NHTSA API');
    }

  } catch (error) {
    console.error('Enhanced VIN decoding error:', error);
    
    // Handle different types of errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      // CORS or network error - provide basic VIN analysis
      console.log('CORS/Network error detected, falling back to basic VIN analysis');
      return fallbackVinAnalysis(vin);
    }
    
    if (error instanceof Error && error.message.includes('CORS')) {
      console.log('CORS error detected, falling back to basic VIN analysis');
      return fallbackVinAnalysis(vin);
    }

    // For other errors, throw a VinDecodingError
    throw new VinDecodingError(
      'VIN decoding service is temporarily unavailable. Basic vehicle information has been extracted from the VIN.',
      'SERVICE_UNAVAILABLE',
      false
    );
  }
};

// Fallback VIN analysis when external APIs fail
const fallbackVinAnalysis = (vin: string): VinDecodeResult => {
  console.log('Performing fallback VIN analysis for:', vin);
  
  // Extract basic info from VIN structure
  const wmi = vin.substring(0, 3); // World Manufacturer Identifier
  const year = getYearFromVin(vin);
  const make = getMakeFromWMI(wmi);
  
  const result: VinDecodeResult = {
    year: year,
    make: make,
    model: 'Unknown', // Cannot determine model from VIN alone reliably
    country: getCountryFromWMI(wmi)
  };
  
  console.log('Fallback analysis result:', result);
  return result;
};

// Parse NHTSA API response
const parseNHTSAResponse = (results: any[]): VinDecodeResult => {
  const getValue = (variableId: number) => {
    const item = results.find(r => r.VariableId === variableId);
    return item?.Value || '';
  };

  return {
    year: getValue(29) || '', // Model Year
    make: getValue(26) || '', // Make
    model: getValue(28) || '', // Model
    transmission: getValue(37) || '', // Transmission Style
    drive_type: getValue(36) || '', // Drive Type
    fuel_type: getValue(24) || '', // Fuel Type - Primary
    body_style: getValue(5) || '', // Body Class
    country: getValue(27) || '', // Plant Country
    engine: getValue(13) || '', // Engine Configuration
    gvwr: getValue(25) || '', // GVWR
    trim: getValue(38) || '' // Trim
  };
};

// Get year from VIN (10th character)
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

// Get make from World Manufacturer Identifier
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
    // Add more as needed
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

// Get country from WMI
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
