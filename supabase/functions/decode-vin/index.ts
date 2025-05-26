
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VinDecodeResult {
  year: string | number | null;
  make: string | null;
  model: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  drive_type?: string | null;
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
    console.log('Decoding VIN:', vin);

    if (!vin || vin.length !== 17) {
      return new Response(
        JSON.stringify({ error: 'Invalid VIN format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Try NHTSA API with retry logic
    let nhtsaResult = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`NHTSA API attempt ${attempt} for VIN: ${vin}`);
        
        const response = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'VIN-Decoder/1.0'
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('NHTSA API success on attempt:', attempt);
          nhtsaResult = parseNhtsaResponse(data);
          break;
        } else {
          console.log(`NHTSA API failed with status ${response.status} on attempt ${attempt}`);
        }
      } catch (error) {
        console.log(`NHTSA API error on attempt ${attempt}:`, error);
        if (attempt === 3) {
          console.log('All NHTSA API attempts failed, using fallback');
        }
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    // If NHTSA failed, use fallback analysis
    const result = nhtsaResult || performFallbackAnalysis(vin);
    
    console.log('Final VIN decode result:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('VIN decode error:', error);
    return new Response(
      JSON.stringify({ error: 'VIN decode failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function parseNhtsaResponse(data: any): VinDecodeResult | null {
  if (!data.Results || !Array.isArray(data.Results)) {
    return null;
  }

  const results = data.Results;
  
  const getValueByVariable = (variableId: number): string => {
    const result = results.find((r: any) => r.VariableId === variableId);
    return result?.Value || '';
  };

  // Enhanced variable ID mapping for all desired fields
  const decodedData: VinDecodeResult = {
    year: parseInt(getValueByVariable(29)) || null,           // Model Year
    make: getValueByVariable(26) || null,                     // Make
    model: getValueByVariable(28) || null,                    // Model
    transmission: getValueByVariable(37) || null,             // Transmission Style
    fuel_type: getValueByVariable(24) || null,                // Fuel Type - Primary
    drive_type: getValueByVariable(35) || null,               // Drive Type
    body_style: getValueByVariable(5) || null,                // Body Class
    country: getValueByVariable(27) || null,                  // Plant Country
    engine: getValueByVariable(13) || null,                   // Engine Configuration
    gvwr: getValueByVariable(25) || null,                     // Gross Vehicle Weight Rating
    trim: getValueByVariable(109) || null,                    // Trim
    color: getValueByVariable(17) || null,                    // Exterior Color
  };

  // Clean up empty values
  Object.keys(decodedData).forEach(key => {
    const value = decodedData[key as keyof VinDecodeResult];
    if (value === '' || value === 'Not Applicable' || value === 'N/A') {
      decodedData[key as keyof VinDecodeResult] = null;
    }
  });

  return decodedData;
}

function performFallbackAnalysis(vin: string): VinDecodeResult {
  console.log('Performing enhanced fallback VIN analysis for:', vin);
  
  // Extract year from VIN (10th character)
  const yearChar = vin.charAt(9);
  const year = getYearFromVinChar(yearChar);
  
  // Extract country from first character
  const countryChar = vin.charAt(0);
  const country = getCountryFromVinChar(countryChar);
  
  // Enhanced make detection from WMI (first 3 characters)
  const wmi = vin.substring(0, 3);
  const make = getMakeFromWMI(wmi);
  
  // Try to extract additional info from VIN structure
  const bodyStyleHint = getBodyStyleHint(vin);
  const engineHint = getEngineHint(vin);
  
  return {
    year,
    make,
    model: 'Unknown',
    country,
    body_style: bodyStyleHint,
    engine: engineHint,
    transmission: null,
    fuel_type: null,
    drive_type: null,
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
    // General Motors
    '1G1': 'Chevrolet', '1G6': 'Cadillac', '1GM': 'Pontiac', '1GC': 'Chevrolet',
    '1GB': 'Chevrolet', '1GK': 'GMC', '1GT': 'GMC', '2G1': 'Chevrolet',
    '2G2': 'Pontiac', '2G3': 'Oldsmobile', '2G4': 'Pontiac',
    
    // Ford Motor Company
    '1FA': 'Ford', '1FB': 'Ford', '1FC': 'Ford', '1FD': 'Ford', 
    '1FM': 'Ford', '1FT': 'Ford', '2FA': 'Ford', '2FB': 'Ford',
    '2FC': 'Ford', '2FM': 'Ford', '2FT': 'Ford', '3FA': 'Ford',
    
    // Chrysler
    '1C3': 'Chrysler', '1C4': 'Chrysler', '1C6': 'Chrysler', '1C8': 'Chrysler',
    '2C3': 'Chrysler', '2C4': 'Chrysler', '2C8': 'Chrysler',
    
    // Honda
    '1HG': 'Honda', '1HF': 'Honda', '2HG': 'Honda', '2HF': 'Honda',
    '3HG': 'Honda', '4HG': 'Honda', '5HG': 'Honda', 'JHM': 'Honda',
    
    // Toyota
    '1TO': 'Toyota', '2TO': 'Toyota', '3TO': 'Toyota', '4T1': 'Toyota',
    '5TB': 'Toyota', 'JT2': 'Toyota', 'JT3': 'Toyota', 'JT4': 'Toyota',
    
    // Nissan
    '1N4': 'Nissan', '1N6': 'Nissan', '3N1': 'Nissan', '3N6': 'Nissan',
    '5N1': 'Nissan', 'JN1': 'Nissan', 'JN6': 'Nissan', 'JN8': 'Nissan',
    
    // Hyundai/Kia
    'KMH': 'Hyundai', 'KMJ': 'Hyundai', 'KNA': 'Kia', 'KNB': 'Kia',
    'KNC': 'Kia', 'KND': 'Kia', 'KNE': 'Kia', 'KNM': 'Kia',
    
    // BMW
    'WBA': 'BMW', 'WBS': 'BMW', 'WBX': 'BMW', '4US': 'BMW',
    '5UX': 'BMW', '5UY': 'BMW',
    
    // Mercedes-Benz
    'WDB': 'Mercedes-Benz', 'WDC': 'Mercedes-Benz', 'WDD': 'Mercedes-Benz',
    'WDF': 'Mercedes-Benz', '4JG': 'Mercedes-Benz',
    
    // Audi
    'WAU': 'Audi', 'WAP': 'Audi', 'WA1': 'Audi',
    
    // Volkswagen
    'WVW': 'Volkswagen', '1VW': 'Volkswagen', '3VW': 'Volkswagen',
    
    // Volvo
    'YV1': 'Volvo', 'YV4': 'Volvo',
    
    // Subaru
    '4S3': 'Subaru', '4S4': 'Subaru', '4S6': 'Subaru', 'JF1': 'Subaru',
    'JF2': 'Subaru',
    
    // Mazda
    '1YV': 'Mazda', '4F2': 'Mazda', '4F4': 'Mazda', 'JM1': 'Mazda',
    'JM3': 'Mazda',
    
    // Mitsubishi
    '4A3': 'Mitsubishi', '4A4': 'Mitsubishi', 'JA3': 'Mitsubishi',
    'JA4': 'Mitsubishi',
  };
  
  // Try exact match first
  if (wmiMap[wmi]) return wmiMap[wmi];
  
  // Try first two characters
  const twoChar = wmi.substring(0, 2);
  if (wmiMap[twoChar]) return wmiMap[twoChar];
  
  // Basic fallback based on first character
  const firstChar = wmi.charAt(0);
  if (['1', '4', '5'].includes(firstChar)) return 'Unknown US Make';
  if (firstChar === '2') return 'Unknown Canadian Make';
  if (firstChar === '3') return 'Unknown Mexican Make';
  if (firstChar === 'J') return 'Unknown Japanese Make';
  if (['K', 'L'].includes(firstChar)) return 'Unknown Korean Make';
  if (['W', 'S', 'Z'].includes(firstChar)) return 'Unknown European Make';
  
  return 'Unknown';
}

function getBodyStyleHint(vin: string): string | null {
  // This is a simplified approach - real VIN decoding would need manufacturer-specific logic
  const char11 = vin.charAt(10); // Sometimes indicates body style
  
  // This is just an example - would need extensive manufacturer databases
  if (['1', '2', '3'].includes(char11)) return 'sedan';
  if (['4', '5'].includes(char11)) return 'suv';
  if (['6', '7'].includes(char11)) return 'truck';
  if (['8', '9'].includes(char11)) return 'wagon';
  
  return null;
}

function getEngineHint(vin: string): string | null {
  // Basic engine hint from 8th character (simplified)
  const char8 = vin.charAt(7);
  
  // This would need manufacturer-specific databases for accuracy
  if (['A', 'B', 'C', '1', '2'].includes(char8)) return 'I4';
  if (['D', 'E', 'F', '3', '4'].includes(char8)) return 'V6';
  if (['G', 'H', 'J', '5', '6'].includes(char8)) return 'V8';
  
  return null;
}
