
import { VinDecodeResult } from '@/types/vehicle';

// This file contains a limited set of VIN prefixes for fallback purposes
// when external API calls fail or are rate-limited
export const mockVinDatabase: Record<string, VinDecodeResult> = {
  // Ford vehicles
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
  
  // Chevrolet vehicles
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
  
  // Toyota vehicles
  "4T1BF1FK": {
    year: "2015",
    make: "toyota",
    model: "Camry",
    transmission: "Automatic",
    transmission_type: "6-Speed Automatic",
    drive_type: "FWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "USA",
    engine: "2.5L 4-Cylinder",
    gvwr: "Class 1B: 3,001 - 4,000 lb"
  },
  
  // Honda vehicles
  "1HGCV1F3": {
    year: "2019",
    make: "honda",
    model: "Accord",
    transmission: "Automatic",
    transmission_type: "CVT",
    drive_type: "FWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "USA",
    engine: "1.5L 4-Cylinder Turbo",
    gvwr: "Class 1B: 3,001 - 4,000 lb"
  },
  
  // Nissan vehicles
  "3N1AB7AP": {
    year: "2016",
    make: "nissan",
    model: "Sentra",
    transmission: "Automatic",
    transmission_type: "CVT",
    drive_type: "FWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "MEXICO",
    engine: "1.8L 4-Cylinder",
    gvwr: "Class 1A: 0 - 3,000 lb"
  },
  
  // BMW vehicles
  "WBA7E2C3": {
    year: "2020",
    make: "bmw",
    model: "3 Series",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic",
    drive_type: "RWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "GERMANY",
    engine: "2.0L 4-Cylinder Turbo",
    gvwr: "Class 1C: 4,001 - 5,000 lb"
  },
  
  // Mercedes vehicles
  "WDDWJ8GB": {
    year: "2021",
    make: "mercedes-benz",
    model: "C-Class",
    transmission: "Automatic",
    transmission_type: "9-Speed Automatic",
    drive_type: "AWD",
    fuel_type: "Gas",
    body_style: "sedan",
    country: "GERMANY",
    engine: "2.0L 4-Cylinder Turbo",
    gvwr: "Class 1C: 4,001 - 5,000 lb"
  }
};
