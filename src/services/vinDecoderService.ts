
import { VinDecodeResult } from "@/types/vehicle";

/**
 * Simple VIN format validation
 * @param vin - The VIN to validate
 * @returns true if the VIN appears to be valid
 */
const isValidVin = (vin: string): boolean => {
  // Basic VIN validation: must be 17 characters and not contain I, O, or Q
  const regexp = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return regexp.test(vin);
};

/**
 * Decode a VIN using a third-party API service
 * @param vin - Vehicle Identification Number to decode
 * @returns Decoded vehicle information or null if unsuccessful
 */
export const decodeVinService = async (vin: string): Promise<VinDecodeResult | null> => {
  // Validate the VIN first
  if (!isValidVin(vin)) {
    console.warn("Invalid VIN format:", vin);
    throw new Error("Invalid VIN format");
  }

  console.log("Decoding VIN:", vin);

  try {
    // For the demo, we're using mock data since we can't make actual API calls
    // In a real application, this would call an actual VIN decoding API
    // Example: const response = await fetch(`https://api.example.com/decode?vin=${vin}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock VIN decoder result based on the first few characters
    // In a real app, this would come from the API response
    const decodedVehicle: VinDecodeResult = {
      year: vin.charAt(9) === "A" ? 2010 : 
            vin.charAt(9) === "B" ? 2011 : 
            vin.charAt(9) === "C" ? 2012 : 
            vin.charAt(9) === "D" ? 2013 : 
            vin.charAt(9) === "E" ? 2014 : 
            vin.charAt(9) === "F" ? 2015 : 
            vin.charAt(9) === "G" ? 2016 : 
            vin.charAt(9) === "H" ? 2017 : 
            vin.charAt(9) === "J" ? 2018 : 
            vin.charAt(9) === "K" ? 2019 : 
            vin.charAt(9) === "L" ? 2020 : 
            vin.charAt(9) === "M" ? 2021 : 2022,
      make: vin.startsWith("1") ? "Toyota" : 
            vin.startsWith("2") ? "Honda" :
            vin.startsWith("3") ? "Ford" :
            vin.startsWith("4") ? "Chevrolet" :
            vin.startsWith("5") ? "BMW" : "Other",
      model: vin.startsWith("1") ? "Camry" :
             vin.startsWith("2") ? "Accord" :
             vin.startsWith("3") ? "F-150" :
             vin.startsWith("4") ? "Silverado" :
             vin.startsWith("5") ? "X5" : "Unknown",
      transmission: vin.charAt(5) === "A" ? "Automatic" : "Manual",
      drive_type: vin.charAt(6) === "1" ? "FWD" : "AWD",
      fuel_type: vin.charAt(7) === "2" ? "Gasoline" : "Diesel",
      body_style: vin.charAt(4) === "1" ? "Sedan" : 
                 vin.charAt(4) === "2" ? "SUV" :
                 vin.charAt(4) === "3" ? "Truck" : "Other",
      trim: vin.charAt(8) === "1" ? "Base" :
            vin.charAt(8) === "2" ? "Sport" :
            vin.charAt(8) === "3" ? "Limited" : "Standard"
    };

    console.log("Decoded VIN successfully:", decodedVehicle);
    return decodedVehicle;
  } catch (error) {
    console.error("Error decoding VIN:", error);
    return null;
  }
};

// Helper function to normalize manufacturer names from different VIN APIs
export const normalizeManufacturer = (make: string): string => {
  // Map common variations of manufacturer names to standardized versions
  const manufacturerMap: Record<string, string> = {
    "gm": "General Motors",
    "chevy": "Chevrolet",
    "mercedes": "Mercedes-Benz",
    "mercedes benz": "Mercedes-Benz",
    "vw": "Volkswagen"
  };
  
  const normalizedMake = make.toLowerCase();
  return manufacturerMap[normalizedMake] || make;
};

// Helper function to decode VIN by parsing specific positions
export const decodeVinPosition = (vin: string): VinDecodeResult => {
  // This is a simplified version of VIN decoding - real systems are much more complex
  // In practice, use a VIN decoding API rather than trying to decode it manually
  
  const result: VinDecodeResult = {};
  
  // Extract model year from 10th position
  const yearCodes = "ABCDEFGHJKLMNPRSTVWXY123456789";
  const yearPositions = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039];
  
  if (vin.length >= 10) {
    const yearChar = vin.charAt(9).toUpperCase();
    const yearIndex = yearCodes.indexOf(yearChar);
    if (yearIndex >= 0) {
      result.year = yearPositions[yearIndex];
    }
  }
  
  // Extract manufacturer from first 3 positions
  if (vin.length >= 3) {
    const wmi = vin.substring(0, 3).toUpperCase();
    
    // Very simplified WMI mapping - real implementations would have a comprehensive database
    if (wmi.startsWith("1G") || wmi.startsWith("3G")) {
      result.make = "General Motors";
    } else if (wmi.startsWith("JH") || wmi.startsWith("1H")) {
      result.make = "Honda";
    } else if (wmi.startsWith("JT") || wmi.startsWith("4T")) {
      result.make = "Toyota";
    } else if (wmi.startsWith("1F") || wmi.startsWith("2F")) {
      result.make = "Ford";
    } else if (wmi.startsWith("WBA") || wmi.startsWith("WBS")) {
      result.make = "BMW";
    } else {
      result.make = "Unknown";
    }
  }
  
  // In a real implementation, you would decode more positions to get model, engine, etc.
  result.trim = "Standard"; // Added trim property
  
  return result;
};
