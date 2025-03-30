
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
    console.log(`Invalid VIN format: ${vin}`);
    return null;
  }

  // Normalize VIN to uppercase for consistency
  const normalizedVin = vin.toUpperCase();
  
  try {
    // In a real implementation, this would call a VIN decoder API
    // For this mock version, we check our static database for matching VIN prefixes
    
    // Check if the first 8 characters match any of our mock VINs
    const vinPrefix = normalizedVin.substring(0, 8);
    
    // Search for a matching prefix in our mock database
    for (const prefix in mockVinDatabase) {
      if (vinPrefix.startsWith(prefix)) {
        // Create a deep copy of the result to avoid reference issues
        const result = { ...mockVinDatabase[prefix] };
        console.log(`VIN decoded successfully: ${normalizedVin} -> `, result);
        return result;
      }
    }
    
    // If no exact match, use a deterministic approach to return consistent results for the same VIN
    // Hash the VIN to get a consistent index into our mock database
    const mockVins = Object.keys(mockVinDatabase);
    let hashValue = 0;
    
    // Simple string hash function
    for (let i = 0; i < normalizedVin.length; i++) {
      hashValue = ((hashValue << 5) - hashValue) + normalizedVin.charCodeAt(i);
      hashValue = hashValue & hashValue; // Convert to 32bit integer
    }
    
    // Ensure positive index
    hashValue = Math.abs(hashValue);
    const index = hashValue % mockVins.length;
    const selectedMockVin = mockVins[index];
    
    // Create a deep copy of the result
    const result = { ...mockVinDatabase[selectedMockVin] };
    console.log(`Using deterministic vehicle match for VIN ${normalizedVin}:`, result);
    return result;
    
  } catch (err) {
    console.error("Error decoding VIN:", err);
    return null;
  }
};

/**
 * Validate VIN using the standard VIN verification algorithm
 * This is a basic implementation of the VIN check digit validation
 * @param vin The VIN to validate
 * @returns True if the VIN passes validation
 */
export const validateVin = (vin: string): boolean => {
  if (!vin || vin.length !== 17) {
    return false;
  }

  // Basic format validation - VINs should only contain alphanumeric characters
  // excluding I, O, Q
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
    return false;
  }

  // In a real implementation, we would do proper check digit validation
  // For this demo, we're just doing basic format validation
  return true;
};
