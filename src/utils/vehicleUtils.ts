
import { VinDecodeResult } from "@/types/vehicle";
import { mockVinDatabase } from "@/data/vinDatabase";

/**
 * Decode a VIN and return vehicle information
 * @param vin The 17-digit Vehicle Identification Number
 * @returns Vehicle information or null if VIN is invalid
 */
export const decodeVin = (vin: string): VinDecodeResult | null => {
  // Validate VIN format (basic validation)
  if (!vin || vin.length !== 17) {
    return null;
  }

  try {
    // In a real implementation, this would call a VIN decoder API
    // For this mock version, we'll check our static database for matching VIN prefixes
    
    // Check if the first 8 characters match any of our mock VINs
    const vinPrefix = vin.substring(0, 8);
    
    // Search for a matching prefix in our mock database
    for (const prefix in mockVinDatabase) {
      if (vinPrefix.startsWith(prefix)) {
        console.log(`VIN decoded: ${vin} -> `, mockVinDatabase[prefix]);
        return mockVinDatabase[prefix];
      }
    }
    
    // If no exact match, return a consistent result based on the VIN
    // Use the first character of the VIN to determine which mock vehicle to return
    const mockVins = Object.keys(mockVinDatabase);
    const vinFirstChar = vin.charAt(0);
    const index = vinFirstChar.charCodeAt(0) % mockVins.length;
    const selectedMockVin = mockVins[index];
    
    console.log(`No exact VIN match, using consistent vehicle for ${vin}:`, mockVinDatabase[selectedMockVin]);
    return mockVinDatabase[selectedMockVin];
    
  } catch (err) {
    console.error("Error decoding VIN:", err);
    return null;
  }
};

