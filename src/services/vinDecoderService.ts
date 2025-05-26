
import { VinDecodeResult } from '@/types/vehicle';

/**
 * Decode VIN using NHTSA API with fallback to basic analysis
 */
export const decodeVin = async (vin: string): Promise<VinDecodeResult | null> => {
  if (!vin || vin.length !== 17) {
    throw new Error('Invalid VIN format. VIN must be 17 characters long.');
  }

  try {
    console.log('Attempting VIN decode with NHTSA API for:', vin);
    
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Results && Array.isArray(data.Results)) {
      const results = data.Results;
      
      const getValueByVariable = (variableId: number): string => {
        const result = results.find(r => r.VariableId === variableId);
        return result?.Value || '';
      };

      return {
        year: parseInt(getValueByVariable(29)) || null,
        make: getValueByVariable(26) || null,
        model: getValueByVariable(28) || null,
        transmission: getValueByVariable(37) || null,
        fuel_type: getValueByVariable(24) || null,
        engine: getValueByVariable(13) || null,
        body_style: getValueByVariable(5) || null,
        country: getValueByVariable(27) || null,
        trim: getValueByVariable(109) || null,
        gvwr: getValueByVariable(25) || null,
      };
    }
    
    throw new Error('Invalid response format from NHTSA API');
    
  } catch (error) {
    console.error('Enhanced VIN decoding error:', error);
    
    // Fallback to basic VIN analysis
    console.log('CORS/Network error detected, falling back to basic VIN analysis');
    
    try {
      const fallbackResult = performFallbackVinAnalysis(vin);
      console.log('Fallback analysis result:', fallbackResult);
      return fallbackResult;
    } catch (fallbackError) {
      console.error('Fallback VIN analysis failed:', fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Basic VIN analysis when API is unavailable
 */
function performFallbackVinAnalysis(vin: string): VinDecodeResult {
  console.log('Performing fallback VIN analysis for:', vin);
  
  // Extract year from VIN (10th character)
  const yearChar = vin.charAt(9);
  const year = getYearFromVinChar(yearChar);
  
  // Extract country from first character
  const countryChar = vin.charAt(0);
  const country = getCountryFromVinChar(countryChar);
  
  // Basic make detection from WMI (first 3 characters)
  const wmi = vin.substring(0, 3);
  const make = getMakeFromWMI(wmi);
  
  return {
    year,
    make,
    model: 'Unknown',
    country,
    transmission: null,
    fuel_type: null,
    engine: null,
    body_style: null,
    trim: null,
    gvwr: null,
  };
}

function getYearFromVinChar(char: string): number | null {
  const yearMap: { [key: string]: number } = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
    'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
    'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
    'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
    'Y': 2030, '1': 2001, '2': 2002, '3': 2003, '4': 2004,
    '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009
  };
  
  return yearMap[char.toUpperCase()] || null;
}

function getCountryFromVinChar(char: string): string {
  const firstChar = char.toUpperCase();
  
  if (['1', '4', '5'].includes(firstChar)) return 'United States';
  if (['2'].includes(firstChar)) return 'Canada';
  if (['3'].includes(firstChar)) return 'Mexico';
  if (['J'].includes(firstChar)) return 'Japan';
  if (['K', 'L'].includes(firstChar)) return 'South Korea';
  if (['S', 'Z'].includes(firstChar)) return 'Europe';
  if (['V', 'W', 'X', 'Y', 'Z'].includes(firstChar)) return 'Europe';
  
  return 'Unknown';
}

function getMakeFromWMI(wmi: string): string {
  const wmiMap: { [key: string]: string } = {
    '1G1': 'Chevrolet',
    '1G6': 'Cadillac',
    '1GM': 'Pontiac',
    '1GC': 'Chevrolet',
    '1GB': 'Chevrolet',
    '1GK': 'GMC',
    '1GT': 'GMC',
    '1FA': 'Ford',
    '1FB': 'Ford',
    '1FC': 'Ford',
    '1FD': 'Ford',
    '1FM': 'Ford',
    '1FT': 'Ford',
    '1FU': 'Freightliner',
    '1FV': 'Freightliner',
    '1GY': 'Cadillac',
    '1H': 'Honda',
    '1HD': 'Harley-Davidson',
    '1J': 'Jeep',
    '1L': 'Lincoln',
    '1M': 'Mercury',
    '1N': 'Nissan',
    '1VW': 'Volkswagen',
    '1YV': 'Mazda',
    '2G': 'Chevrolet',
    '2C': 'Chrysler',
    '2F': 'Ford',
    '2H': 'Honda',
    '2T': 'Toyota',
    '3F': 'Ford',
    '3G': 'Chevrolet',
    '3N': 'Nissan',
    '3VW': 'Volkswagen',
    '4F': 'Mazda',
    '4J': 'Mercedes-Benz',
    '4S': 'Subaru',
    '4T': 'Toyota',
    '4U': 'BMW',
    '5F': 'Honda',
    '5J': 'Honda',
    '5L': 'Lincoln',
    '5N': 'Nissan',
    '5T': 'Toyota',
    '5Y': 'Toyota',
    'JH': 'Honda',
    'JM': 'Mazda',
    'JN': 'Nissan',
    'JT': 'Toyota',
    'KM': 'Hyundai',
    'KN': 'Kia',
    'SAL': 'Land Rover',
    'SAJ': 'Jaguar',
    'SCC': 'Lotus',
    'WAU': 'Audi',
    'WBA': 'BMW',
    'WBS': 'BMW',
    'WDB': 'Mercedes-Benz',
    'WDC': 'DaimlerChrysler',
    'WDD': 'Mercedes-Benz',
    'WMW': 'MINI',
    'WP0': 'Porsche',
    'WVW': 'Volkswagen',
    'YV1': 'Volvo',
    'ZAM': 'Maserati',
    'ZAR': 'Alfa Romeo',
    'ZFA': 'Fiat'
  };
  
  // Try exact match first
  if (wmiMap[wmi]) return wmiMap[wmi];
  
  // Try first two characters
  const twoChar = wmi.substring(0, 2);
  if (wmiMap[twoChar]) return wmiMap[twoChar];
  
  // Try first character patterns
  const firstChar = wmi.charAt(0);
  if (firstChar === '1') return 'Ford'; // Most common US make starting with 1
  if (firstChar === '2') return 'Chevrolet'; // Most common Canadian make
  if (firstChar === 'J') return 'Honda'; // Most common Japanese make
  if (firstChar === 'K') return 'Hyundai'; // Korean
  if (firstChar === 'W') return 'BMW'; // German
  
  return 'Unknown';
}
