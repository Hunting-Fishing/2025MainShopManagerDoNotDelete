
import { VinDecodeResult } from '@/types/vehicle';

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
  },
  "5YJSA1E": { 
    year: "2021", 
    make: "tesla", 
    model: "Model S",
    transmission: "Automatic",
    transmission_type: "Single-Speed",
    drive_type: "AWD",
    fuel_type: "Electric",
    body_style: "sedan",
    country: "USA",
    engine: "Dual Motor Electric",
    gvwr: "Class 2A: 6,001 - 8,500 lb"
  },
  "WAUFFAF": { 
    year: "2020", 
    make: "audi", 
    model: "A4",
    transmission: "Automatic",
    transmission_type: "7-Speed Dual-Clutch",
    drive_type: "AWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "GERMANY",
    engine: "2.0L 4-Cylinder Turbo",
    gvwr: "Class 1C: 4,001 - 5,000 lb"
  },
  "JH4KB26": { 
    year: "2019", 
    make: "acura", 
    model: "TLX",
    transmission: "Automatic",
    transmission_type: "9-Speed Automatic",
    drive_type: "FWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "JAPAN",
    engine: "2.4L 4-Cylinder",
    gvwr: "Class 1C: 4,001 - 5,000 lb"
  },
  "3GCUKSEC": { 
    year: "2020", 
    make: "chevrolet", 
    model: "Silverado",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic",
    drive_type: "4x4",
    fuel_type: "Gas",
    body_style: "truck",
    country: "USA",
    engine: "5.3L V8",
    gvwr: "Class 2B: 8,501 - 10,000 lb"
  },
  "4T1BF1FK": { 
    year: "2021", 
    make: "toyota", 
    model: "Camry",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic",
    drive_type: "FWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "USA",
    engine: "2.5L 4-Cylinder",
    gvwr: "Class 1B: 3,001 - 4,000 lb"
  },
  "WBA5B1C": { 
    year: "2019", 
    make: "bmw", 
    model: "5 Series",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic",
    drive_type: "RWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "GERMANY",
    engine: "2.0L 4-Cylinder Turbo",
    gvwr: "Class 1C: 4,001 - 5,000 lb"
  },
  "1C4RJFAG": { 
    year: "2022", 
    make: "jeep", 
    model: "Grand Cherokee",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic",
    drive_type: "4x4",
    fuel_type: "Gas",
    body_style: "suv",
    country: "USA",
    engine: "3.6L V6",
    gvwr: "Class 2A: 6,001 - 8,500 lb"
  }
};
