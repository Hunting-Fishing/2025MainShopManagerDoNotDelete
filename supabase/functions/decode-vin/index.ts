
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VinDecodeResult {
  year: string | number | null;
  make: string | null;
  model: string | null;
  transmission?: string | null;
  transmission_type?: string | null;
  drive_type?: string | null;
  fuel_type?: string | null;
  body_style?: string | null;
  country?: string | null;
  engine?: string | null;
  gvwr?: string | null;
  trim?: string | null;
  color?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vin } = await req.json();
    
    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN format');
    }

    console.log('Decoding VIN:', vin);

    // Call NHTSA API
    const nhtsaResponse = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!nhtsaResponse.ok) {
      throw new Error(`NHTSA API error: ${nhtsaResponse.status}`);
    }

    const nhtsaData = await nhtsaResponse.json();
    
    if (nhtsaData.Results && Array.isArray(nhtsaData.Results)) {
      const results = nhtsaData.Results;
      
      const getValueByVariable = (variableId: number): string => {
        const result = results.find(r => r.VariableId === variableId);
        return result?.Value || '';
      };

      // Enhanced variable mapping for more fields
      const vinResult: VinDecodeResult = {
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
        drive_type: getValueByVariable(35) || null,
        color: getValueByVariable(17) || null,
      };

      // Clean up empty values
      Object.keys(vinResult).forEach(key => {
        if (vinResult[key as keyof VinDecodeResult] === '' || 
            vinResult[key as keyof VinDecodeResult] === 'Not Applicable' ||
            vinResult[key as keyof VinDecodeResult] === 'N/A') {
          vinResult[key as keyof VinDecodeResult] = null;
        }
      });

      console.log('VIN decode result:', vinResult);

      return new Response(JSON.stringify(vinResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If NHTSA fails, use fallback analysis
    console.log('NHTSA data invalid, using fallback');
    const fallbackResult = performFallbackVinAnalysis(vin);
    
    return new Response(JSON.stringify(fallbackResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('VIN decode error:', error);
    
    // Try fallback analysis on error
    try {
      const { vin } = await req.json();
      const fallbackResult = performFallbackVinAnalysis(vin);
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fallbackError) {
      console.error('Fallback analysis failed:', fallbackError);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
});

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
    model: null, // Cannot reliably determine model from VIN alone
    country,
    transmission: null,
    fuel_type: null,
    engine: null,
    body_style: null,
    trim: null,
    gvwr: null,
    color: null,
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
    '1G1': 'Chevrolet', '1G6': 'Cadillac', '1GM': 'Pontiac', '1GC': 'Chevrolet',
    '1GB': 'Chevrolet', '1GK': 'GMC', '1GT': 'GMC', '1FA': 'Ford', '1FB': 'Ford',
    '1FC': 'Ford', '1FD': 'Ford', '1FM': 'Ford', '1FT': 'Ford', '1H': 'Honda',
    '1J': 'Jeep', '1L': 'Lincoln', '1M': 'Mercury', '1N': 'Nissan', '1VW': 'Volkswagen',
    '2G': 'Chevrolet', '2C': 'Chrysler', '2F': 'Ford', '2H': 'Honda', '2T': 'Toyota',
    '3F': 'Ford', '3G': 'Chevrolet', '3N': 'Nissan', '3VW': 'Volkswagen',
    '4F': 'Mazda', '4J': 'Mercedes-Benz', '4S': 'Subaru', '4T': 'Toyota', '4U': 'BMW',
    '5F': 'Honda', '5J': 'Honda', '5L': 'Lincoln', '5N': 'Nissan', '5T': 'Toyota',
    'JH': 'Honda', 'JM': 'Mazda', 'JN': 'Nissan', 'JT': 'Toyota', 'KM': 'Hyundai',
    'KN': 'Kia', 'SAL': 'Land Rover', 'SAJ': 'Jaguar', 'WAU': 'Audi', 'WBA': 'BMW',
    'WDB': 'Mercedes-Benz', 'WVW': 'Volkswagen', 'YV1': 'Volvo', '2GN': 'Chevrolet'
  };
  
  // Try exact match first
  if (wmiMap[wmi]) return wmiMap[wmi];
  
  // Try first two characters
  const twoChar = wmi.substring(0, 2);
  if (wmiMap[twoChar]) return wmiMap[twoChar];
  
  // Try first character patterns
  const firstChar = wmi.charAt(0);
  if (firstChar === '1') return 'GM/Ford';
  if (firstChar === '2') return 'GM/Ford';
  if (firstChar === 'J') return 'Japanese';
  if (firstChar === 'K') return 'Korean';
  if (firstChar === 'W') return 'German';
  
  return 'Unknown';
}
