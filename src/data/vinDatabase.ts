import { VinDecodeResult } from "@/types/vehicle";

// This file contains a limited set of VIN prefixes for fallback purposes
// when external API calls fail or are rate-limited
export const mockVinDatabase: Record<string, VinDecodeResult> = {
  // We'll keep a small subset of the most common VIN prefixes for fallback
  "1FTFW1ET": { 
    year: "2018", 
    make: "ford", 
    model: "F-150",
    transmission: "Automatic",
    transmission_type: "10-Speed Automatic",
    drive_type: "4x4",
    fuel_type: "Gas",
    body_style: "truck",
    country: "USA",
    engine: "3.5L V6 EcoBoost",
    gvwr: "Class 3: 10,001 - 14,000 lb"
  },
  "1G1ZD5ST": { 
    year: "2017", 
    make: "chevrolet", 
    model: "Malibu",
    transmission: "Automatic",
    transmission_type: "6-Speed Automatic",
    drive_type: "FWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "USA",
    engine: "1.5L 4-Cylinder Turbo",
    gvwr: "Class 1B: 3,001 - 4,000 lb"
  },
  "2GNFLNEK": { 
    year: "2013", 
    make: "chevrolet", 
    model: "Equinox",
    transmission: "Automatic",
    transmission_type: "6-Speed Automatic",
    drive_type: "AWD",
    fuel_type: "Gas",
    body_style: "suv",
    country: "CANADA",
    engine: "2.4L 4-Cylinder",
    gvwr: "Class 1D: 5,001 - 6,000 lb"
  }
};
