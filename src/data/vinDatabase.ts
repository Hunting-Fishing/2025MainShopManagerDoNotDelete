
import { VinDecodeResult } from "@/types/vehicle";

// Mock VIN database - simplified for demo purposes
// Structure: VIN prefix (first 8 chars) -> vehicle info
export const mockVinDatabase: Record<string, VinDecodeResult> = {
  "1FTFW1ET": { year: "2018", make: "ford", model: "F-150" },
  "1G1ZD5ST": { year: "2017", make: "chevrolet", model: "Malibu" },
  "1HGCV1F3": { year: "2019", make: "honda", model: "Accord" },
  "2T1BURH": { year: "2020", make: "toyota", model: "Corolla" },
  "JN1AZ4EH": { year: "2016", make: "nissan", model: "370Z" },
  "3VWCB7AU": { year: "2021", make: "volkswagen", model: "Jetta" },
  "5YJSA1E4": { year: "2019", make: "tesla", model: "Model S" },
  "WAUENAF4": { year: "2017", make: "audi", model: "A4" },
  "4JGDA5HB": { year: "2020", make: "mercedes-benz", model: "GLE" },
  "WBA3N5C5": { year: "2018", make: "bmw", model: "3 Series" },
  "YV4A22PK": { year: "2021", make: "volvo", model: "XC60" },
  "5TFDY5F1": { year: "2022", make: "toyota", model: "Tundra" },
  "1C6SRFJT": { year: "2023", make: "ram", model: "1500" },
  "1C4RJFBG": { year: "2020", make: "jeep", model: "Grand Cherokee" },
  "KM8J3CAL": { year: "2021", make: "hyundai", model: "Santa Fe" },
  "5XXG64J2": { year: "2019", make: "kia", model: "Optima" },
  "JF2GTAMC": { year: "2022", make: "subaru", model: "Forester" },
  "KMHLM4AG": { year: "2023", make: "hyundai", model: "Elantra" },
  "2HGFC2F5": { year: "2022", make: "honda", model: "Civic" },
  "3GNAXKEV": { year: "2021", make: "chevrolet", model: "Equinox" }
};
