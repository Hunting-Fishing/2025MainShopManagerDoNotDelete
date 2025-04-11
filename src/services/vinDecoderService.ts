
import { VinDecodeResult } from "@/types/vehicle";
import { mockVinDatabase } from "@/data/vinDatabase";

/**
 * Decode a Vehicle Identification Number (VIN)
 */
export async function decodeVin(vin: string): Promise<VinDecodeResult | null> {
  if (!vin || vin.length !== 17) {
    return null;
  }

  try {
    // Check if the VIN prefix exists in our mock database
    for (const prefix in mockVinDatabase) {
      if (vin.startsWith(prefix)) {
        // If there's a match, return the mock data
        return {
          ...mockVinDatabase[prefix],
          // Let's generate a slightly different year based on VIN character to add variety
          year: parseInt(String(mockVinDatabase[prefix].year)) + (parseInt(vin.charAt(9), 36) % 5)
        };
      }
    }
    
    // If no match in our database, generate a generic response
    // This would be replaced with an actual API call in production
    // Wait a bit to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate basic vehicle info based on first few VIN characters
    const make = getVehicleMakeFromVIN(vin);
    const model = getVehicleModelFromVIN(vin, make);
    const year = getYearFromVIN(vin);
    
    return {
      year,
      make,
      model,
      transmission: "Automatic",
      drive_type: ["FWD", "RWD", "AWD", "4WD"][parseInt(vin.charAt(4), 36) % 4],
      fuel_type: "Gasoline",
      body_style: "sedan",
      country: "USA",
      engine: `${(1 + (parseInt(vin.charAt(6), 36) % 6)).toFixed(1)}L Engine`
    };
  } catch (error) {
    console.error('Error in VIN decoder service:', error);
    return null;
  }
}

// Helper functions to extract vehicle information from VIN patterns
function getVehicleMakeFromVIN(vin: string): string {
  const firstChar = vin.charAt(0);
  const secondChar = vin.charAt(1);
  
  // Simple mapping based on World Manufacturer Identifier (WMI)
  if (firstChar === '1' || firstChar === '4' || firstChar === '5') return 'chevrolet';
  if (firstChar === '2') return 'ford';
  if (firstChar === '3') return 'toyota';
  if (firstChar === 'J') return 'honda';
  if (firstChar === 'W') return 'volkswagen';
  if (firstChar === 'S' && 'AHUV'.includes(secondChar)) return 'audi';
  if (firstChar === 'W' && 'ABUV'.includes(secondChar)) return 'bmw';
  
  return 'unknown';
}

function getVehicleModelFromVIN(vin: string, make: string): string {
  // Simple model determination based on position
  const modelChar = vin.charAt(3) + vin.charAt(4);
  
  const modelMap: Record<string, Record<string, string>> = {
    'chevrolet': {
      'AB': 'Malibu', 
      'BC': 'Camaro', 
      'DE': 'Equinox',
      'FG': 'Silverado'
    },
    'ford': {
      'AB': 'Focus',
      'BC': 'Fusion',
      'DE': 'F-150',
      'FG': 'Explorer'
    },
    'toyota': {
      'AB': 'Corolla',
      'BC': 'Camry',
      'DE': 'RAV4',
      'FG': 'Tacoma'
    },
    'honda': {
      'AB': 'Accord',
      'BC': 'Civic',
      'DE': 'CR-V',
      'FG': 'Pilot'
    }
  };
  
  if (modelMap[make] && modelMap[make][modelChar]) {
    return modelMap[make][modelChar];
  }
  
  return `${make} model`;
}

function getYearFromVIN(vin: string): number {
  // Position 10 in VIN often indicates the model year
  const yearChar = vin.charAt(9);
  const baseYear = 2010;
  
  // Generate a year between 2010-2023 based on the character
  return baseYear + (parseInt(yearChar, 36) % 14);
}
