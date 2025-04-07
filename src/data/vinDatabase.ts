
import { VinDecodeResult } from "@/types/vehicle";

// Mock VIN database - simplified for demo purposes
// Structure: VIN prefix (first 8 chars) -> vehicle info
export const mockVinDatabase: Record<string, VinDecodeResult> = {
  "1FTFW1ET": { 
    year: "2018", 
    make: "ford", 
    model: "F-150",
    transmission: "Automatic",
    transmission_type: "10-Speed Automatic" 
  },
  "1G1ZD5ST": { 
    year: "2017", 
    make: "chevrolet", 
    model: "Malibu",
    transmission: "Automatic",
    transmission_type: "6-Speed Automatic" 
  },
  "1HGCV1F3": { 
    year: "2019", 
    make: "honda", 
    model: "Accord",
    transmission: "Automatic",
    transmission_type: "CVT" 
  },
  "2T1BURH": { 
    year: "2020", 
    make: "toyota", 
    model: "Corolla",
    transmission: "Automatic",
    transmission_type: "CVT" 
  },
  "JN1AZ4EH": { 
    year: "2016", 
    make: "nissan", 
    model: "370Z",
    transmission: "Manual",
    transmission_type: "6-Speed Manual" 
  },
  "3VWCB7AU": { 
    year: "2021", 
    make: "volkswagen", 
    model: "Jetta",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic" 
  },
  "5YJSA1E4": { 
    year: "2019", 
    make: "tesla", 
    model: "Model S",
    transmission: "Automatic",
    transmission_type: "1-Speed Direct Drive" 
  },
  "WAUENAF4": { 
    year: "2017", 
    make: "audi", 
    model: "A4",
    transmission: "Automatic",
    transmission_type: "7-Speed Dual-Clutch Automatic" 
  },
  "4JGDA5HB": { 
    year: "2020", 
    make: "mercedes-benz", 
    model: "GLE",
    transmission: "Automatic",
    transmission_type: "9-Speed Automatic" 
  },
  "WBA3N5C5": { 
    year: "2018", 
    make: "bmw", 
    model: "3 Series",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic" 
  },
  "YV4A22PK": { 
    year: "2021", 
    make: "volvo", 
    model: "XC60",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic" 
  },
  "5TFDY5F1": { 
    year: "2022", 
    make: "toyota", 
    model: "Tundra",
    transmission: "Automatic",
    transmission_type: "10-Speed Automatic" 
  },
  "1C6SRFJT": { 
    year: "2023", 
    make: "ram", 
    model: "1500",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic" 
  },
  "1C4RJFBG": { 
    year: "2020", 
    make: "jeep", 
    model: "Grand Cherokee",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic" 
  },
  "KM8J3CAL": { 
    year: "2021", 
    make: "hyundai", 
    model: "Santa Fe",
    transmission: "Automatic",
    transmission_type: "8-Speed Automatic" 
  },
  "5XXG64J2": { 
    year: "2019", 
    make: "kia", 
    model: "Optima",
    transmission: "Automatic",
    transmission_type: "6-Speed Automatic" 
  },
  "JF2GTAMC": { 
    year: "2022", 
    make: "subaru", 
    model: "Forester",
    transmission: "Automatic",
    transmission_type: "CVT" 
  },
  "KMHLM4AG": { 
    year: "2023", 
    make: "hyundai", 
    model: "Elantra",
    transmission: "Automatic",
    transmission_type: "CVT" 
  },
  "2HGFC2F5": { 
    year: "2022", 
    make: "honda", 
    model: "Civic",
    transmission: "Automatic",
    transmission_type: "CVT" 
  },
  "3GNAXKEV": { 
    year: "2021", 
    make: "chevrolet", 
    model: "Equinox",
    transmission: "Automatic",
    transmission_type: "6-Speed Automatic" 
  }
};
