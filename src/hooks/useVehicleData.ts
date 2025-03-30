import { useState, useEffect, useCallback } from 'react';

// Define types for car data
export interface CarMake {
  make_id: string;
  make_display: string;
  make_is_common: string;
  make_country: string;
}

export interface CarModel {
  model_name: string;
  model_make_id: string;
}

export interface CarYear {
  year: number;
}

// Define type for VIN decode result
export interface VinDecodeResult {
  year: string;
  make: string;
  model: string;
  trim?: string;
}

// Mock car makes data
const mockMakes: CarMake[] = [
  { make_id: 'acura', make_display: 'Acura', make_is_common: '1', make_country: 'USA' },
  { make_id: 'alfa-romeo', make_display: 'Alfa Romeo', make_is_common: '1', make_country: 'Italy' },
  { make_id: 'aston-martin', make_display: 'Aston Martin', make_is_common: '1', make_country: 'UK' },
  { make_id: 'audi', make_display: 'Audi', make_is_common: '1', make_country: 'Germany' },
  { make_id: 'bentley', make_display: 'Bentley', make_is_common: '1', make_country: 'UK' },
  { make_id: 'bmw', make_display: 'BMW', make_is_common: '1', make_country: 'Germany' },
  { make_id: 'buick', make_display: 'Buick', make_is_common: '1', make_country: 'USA' },
  { make_id: 'cadillac', make_display: 'Cadillac', make_is_common: '1', make_country: 'USA' },
  { make_id: 'chevrolet', make_display: 'Chevrolet', make_is_common: '1', make_country: 'USA' },
  { make_id: 'chrysler', make_display: 'Chrysler', make_is_common: '1', make_country: 'USA' },
  { make_id: 'dodge', make_display: 'Dodge', make_is_common: '1', make_country: 'USA' },
  { make_id: 'ferrari', make_display: 'Ferrari', make_is_common: '1', make_country: 'Italy' },
  { make_id: 'fiat', make_display: 'Fiat', make_is_common: '1', make_country: 'Italy' },
  { make_id: 'ford', make_display: 'Ford', make_is_common: '1', make_country: 'USA' },
  { make_id: 'genesis', make_display: 'Genesis', make_is_common: '1', make_country: 'South Korea' },
  { make_id: 'gmc', make_display: 'GMC', make_is_common: '1', make_country: 'USA' },
  { make_id: 'honda', make_display: 'Honda', make_is_common: '1', make_country: 'Japan' },
  { make_id: 'hyundai', make_display: 'Hyundai', make_is_common: '1', make_country: 'South Korea' },
  { make_id: 'infiniti', make_display: 'Infiniti', make_is_common: '1', make_country: 'Japan' },
  { make_id: 'jaguar', make_display: 'Jaguar', make_is_common: '1', make_country: 'UK' },
  { make_id: 'jeep', make_display: 'Jeep', make_is_common: '1', make_country: 'USA' },
  { make_id: 'kia', make_display: 'Kia', make_is_common: '1', make_country: 'South Korea' },
  { make_id: 'lamborghini', make_display: 'Lamborghini', make_is_common: '1', make_country: 'Italy' },
  { make_id: 'land-rover', make_display: 'Land Rover', make_is_common: '1', make_country: 'UK' },
  { make_id: 'lexus', make_display: 'Lexus', make_is_common: '1', make_country: 'Japan' },
  { make_id: 'lincoln', make_display: 'Lincoln', make_is_common: '1', make_country: 'USA' },
  { make_id: 'maserati', make_display: 'Maserati', make_is_common: '1', make_country: 'Italy' },
  { make_id: 'mazda', make_display: 'Mazda', make_is_common: '1', make_country: 'Japan' },
  { make_id: 'mercedes-benz', make_display: 'Mercedes-Benz', make_is_common: '1', make_country: 'Germany' },
  { make_id: 'mini', make_display: 'MINI', make_is_common: '1', make_country: 'UK' },
  { make_id: 'mitsubishi', make_display: 'Mitsubishi', make_is_common: '1', make_country: 'Japan' },
  { make_id: 'nissan', make_display: 'Nissan', make_is_common: '1', make_country: 'Japan' },
  { make_id: 'porsche', make_display: 'Porsche', make_is_common: '1', make_country: 'Germany' },
  { make_id: 'ram', make_display: 'RAM', make_is_common: '1', make_country: 'USA' },
  { make_id: 'rolls-royce', make_display: 'Rolls-Royce', make_is_common: '1', make_country: 'UK' },
  { make_id: 'subaru', make_display: 'Subaru', make_is_common: '1', make_country: 'Japan' },
  { make_id: 'tesla', make_display: 'Tesla', make_is_common: '1', make_country: 'USA' },
  { make_id: 'toyota', make_display: 'Toyota', make_is_common: '1', make_country: 'Japan' },
  { make_id: 'volkswagen', make_display: 'Volkswagen', make_is_common: '1', make_country: 'Germany' },
  { make_id: 'volvo', make_display: 'Volvo', make_is_common: '1', make_country: 'Sweden' },
];

// Extended mock models data for all makes
const mockModelsByMake: Record<string, CarModel[]> = {
  'acura': [
    { model_name: 'ILX', model_make_id: 'acura' },
    { model_name: 'MDX', model_make_id: 'acura' },
    { model_name: 'RDX', model_make_id: 'acura' },
    { model_name: 'TLX', model_make_id: 'acura' },
  ],
  'alfa-romeo': [
    { model_name: 'Giulia', model_make_id: 'alfa-romeo' },
    { model_name: 'Stelvio', model_make_id: 'alfa-romeo' },
    { model_name: '4C', model_make_id: 'alfa-romeo' },
  ],
  'aston-martin': [
    { model_name: 'DB11', model_make_id: 'aston-martin' },
    { model_name: 'Vantage', model_make_id: 'aston-martin' },
    { model_name: 'DBS', model_make_id: 'aston-martin' },
    { model_name: 'DBX', model_make_id: 'aston-martin' },
  ],
  'audi': [
    { model_name: 'A3', model_make_id: 'audi' },
    { model_name: 'A4', model_make_id: 'audi' },
    { model_name: 'A6', model_make_id: 'audi' },
    { model_name: 'Q5', model_make_id: 'audi' },
    { model_name: 'Q7', model_make_id: 'audi' },
  ],
  'bentley': [
    { model_name: 'Continental GT', model_make_id: 'bentley' },
    { model_name: 'Bentayga', model_make_id: 'bentley' },
    { model_name: 'Flying Spur', model_make_id: 'bentley' },
  ],
  'bmw': [
    { model_name: '3 Series', model_make_id: 'bmw' },
    { model_name: '5 Series', model_make_id: 'bmw' },
    { model_name: 'X3', model_make_id: 'bmw' },
    { model_name: 'X5', model_make_id: 'bmw' },
    { model_name: 'M3', model_make_id: 'bmw' },
    { model_name: 'M5', model_make_id: 'bmw' },
  ],
  'buick': [
    { model_name: 'Encore', model_make_id: 'buick' },
    { model_name: 'Enclave', model_make_id: 'buick' },
    { model_name: 'Envision', model_make_id: 'buick' },
    { model_name: 'LaCrosse', model_make_id: 'buick' },
  ],
  'cadillac': [
    { model_name: 'Escalade', model_make_id: 'cadillac' },
    { model_name: 'CT4', model_make_id: 'cadillac' },
    { model_name: 'CT5', model_make_id: 'cadillac' },
    { model_name: 'XT4', model_make_id: 'cadillac' },
    { model_name: 'XT5', model_make_id: 'cadillac' },
  ],
  'chevrolet': [
    { model_name: 'Silverado', model_make_id: 'chevrolet' },
    { model_name: 'Equinox', model_make_id: 'chevrolet' },
    { model_name: 'Malibu', model_make_id: 'chevrolet' },
    { model_name: 'Traverse', model_make_id: 'chevrolet' },
    { model_name: 'Tahoe', model_make_id: 'chevrolet' },
    { model_name: 'Corvette', model_make_id: 'chevrolet' },
    { model_name: 'Camaro', model_make_id: 'chevrolet' },
  ],
  'chrysler': [
    { model_name: '300', model_make_id: 'chrysler' },
    { model_name: 'Pacifica', model_make_id: 'chrysler' },
    { model_name: 'Voyager', model_make_id: 'chrysler' },
  ],
  'dodge': [
    { model_name: 'Charger', model_make_id: 'dodge' },
    { model_name: 'Challenger', model_make_id: 'dodge' },
    { model_name: 'Durango', model_make_id: 'dodge' },
    { model_name: 'Journey', model_make_id: 'dodge' },
  ],
  'ferrari': [
    { model_name: '488', model_make_id: 'ferrari' },
    { model_name: 'F8 Tributo', model_make_id: 'ferrari' },
    { model_name: 'Roma', model_make_id: 'ferrari' },
    { model_name: 'SF90 Stradale', model_make_id: 'ferrari' },
  ],
  'fiat': [
    { model_name: '500', model_make_id: 'fiat' },
    { model_name: '500X', model_make_id: 'fiat' },
    { model_name: '124 Spider', model_make_id: 'fiat' },
  ],
  'ford': [
    { model_name: 'F-150', model_make_id: 'ford' },
    { model_name: 'Escape', model_make_id: 'ford' },
    { model_name: 'Explorer', model_make_id: 'ford' },
    { model_name: 'Mustang', model_make_id: 'ford' },
    { model_name: 'Edge', model_make_id: 'ford' },
    { model_name: 'Bronco', model_make_id: 'ford' },
    { model_name: 'Ranger', model_make_id: 'ford' },
  ],
  'genesis': [
    { model_name: 'G70', model_make_id: 'genesis' },
    { model_name: 'G80', model_make_id: 'genesis' },
    { model_name: 'G90', model_make_id: 'genesis' },
    { model_name: 'GV70', model_make_id: 'genesis' },
    { model_name: 'GV80', model_make_id: 'genesis' },
  ],
  'gmc': [
    { model_name: 'Sierra', model_make_id: 'gmc' },
    { model_name: 'Yukon', model_make_id: 'gmc' },
    { model_name: 'Terrain', model_make_id: 'gmc' },
    { model_name: 'Acadia', model_make_id: 'gmc' },
    { model_name: 'Canyon', model_make_id: 'gmc' },
  ],
  'honda': [
    { model_name: 'Accord', model_make_id: 'honda' },
    { model_name: 'Civic', model_make_id: 'honda' },
    { model_name: 'CR-V', model_make_id: 'honda' },
    { model_name: 'Pilot', model_make_id: 'honda' },
    { model_name: 'Odyssey', model_make_id: 'honda' },
    { model_name: 'HR-V', model_make_id: 'honda' },
    { model_name: 'Passport', model_make_id: 'honda' },
  ],
  'hyundai': [
    { model_name: 'Elantra', model_make_id: 'hyundai' },
    { model_name: 'Sonata', model_make_id: 'hyundai' },
    { model_name: 'Santa Fe', model_make_id: 'hyundai' },
    { model_name: 'Tucson', model_make_id: 'hyundai' },
    { model_name: 'Kona', model_make_id: 'hyundai' },
    { model_name: 'Palisade', model_make_id: 'hyundai' },
  ],
  'infiniti': [
    { model_name: 'Q50', model_make_id: 'infiniti' },
    { model_name: 'Q60', model_make_id: 'infiniti' },
    { model_name: 'QX50', model_make_id: 'infiniti' },
    { model_name: 'QX60', model_make_id: 'infiniti' },
    { model_name: 'QX80', model_make_id: 'infiniti' },
  ],
  'jaguar': [
    { model_name: 'F-PACE', model_make_id: 'jaguar' },
    { model_name: 'XE', model_make_id: 'jaguar' },
    { model_name: 'XF', model_make_id: 'jaguar' },
    { model_name: 'E-PACE', model_make_id: 'jaguar' },
    { model_name: 'F-TYPE', model_make_id: 'jaguar' },
  ],
  'jeep': [
    { model_name: 'Wrangler', model_make_id: 'jeep' },
    { model_name: 'Grand Cherokee', model_make_id: 'jeep' },
    { model_name: 'Cherokee', model_make_id: 'jeep' },
    { model_name: 'Compass', model_make_id: 'jeep' },
    { model_name: 'Renegade', model_make_id: 'jeep' },
    { model_name: 'Gladiator', model_make_id: 'jeep' },
  ],
  'kia': [
    { model_name: 'Sportage', model_make_id: 'kia' },
    { model_name: 'Sorento', model_make_id: 'kia' },
    { model_name: 'Forte', model_make_id: 'kia' },
    { model_name: 'Soul', model_make_id: 'kia' },
    { model_name: 'Telluride', model_make_id: 'kia' },
    { model_name: 'Seltos', model_make_id: 'kia' },
  ],
  'lamborghini': [
    { model_name: 'Huracán', model_make_id: 'lamborghini' },
    { model_name: 'Aventador', model_make_id: 'lamborghini' },
    { model_name: 'Urus', model_make_id: 'lamborghini' },
  ],
  'land-rover': [
    { model_name: 'Range Rover', model_make_id: 'land-rover' },
    { model_name: 'Range Rover Sport', model_make_id: 'land-rover' },
    { model_name: 'Discovery', model_make_id: 'land-rover' },
    { model_name: 'Defender', model_make_id: 'land-rover' },
    { model_name: 'Evoque', model_make_id: 'land-rover' },
  ],
  'lexus': [
    { model_name: 'ES', model_make_id: 'lexus' },
    { model_name: 'RX', model_make_id: 'lexus' },
    { model_name: 'NX', model_make_id: 'lexus' },
    { model_name: 'IS', model_make_id: 'lexus' },
    { model_name: 'GX', model_make_id: 'lexus' },
    { model_name: 'LX', model_make_id: 'lexus' },
  ],
  'lincoln': [
    { model_name: 'Navigator', model_make_id: 'lincoln' },
    { model_name: 'Aviator', model_make_id: 'lincoln' },
    { model_name: 'Corsair', model_make_id: 'lincoln' },
    { model_name: 'Nautilus', model_make_id: 'lincoln' },
  ],
  'maserati': [
    { model_name: 'Ghibli', model_make_id: 'maserati' },
    { model_name: 'Levante', model_make_id: 'maserati' },
    { model_name: 'Quattroporte', model_make_id: 'maserati' },
    { model_name: 'MC20', model_make_id: 'maserati' },
  ],
  'mazda': [
    { model_name: 'CX-5', model_make_id: 'mazda' },
    { model_name: 'Mazda3', model_make_id: 'mazda' },
    { model_name: 'Mazda6', model_make_id: 'mazda' },
    { model_name: 'CX-9', model_make_id: 'mazda' },
    { model_name: 'MX-5 Miata', model_make_id: 'mazda' },
    { model_name: 'CX-30', model_make_id: 'mazda' },
  ],
  'mercedes-benz': [
    { model_name: 'C-Class', model_make_id: 'mercedes-benz' },
    { model_name: 'E-Class', model_make_id: 'mercedes-benz' },
    { model_name: 'S-Class', model_make_id: 'mercedes-benz' },
    { model_name: 'GLE', model_make_id: 'mercedes-benz' },
    { model_name: 'GLC', model_make_id: 'mercedes-benz' },
    { model_name: 'GLS', model_make_id: 'mercedes-benz' },
    { model_name: 'A-Class', model_make_id: 'mercedes-benz' },
  ],
  'mini': [
    { model_name: 'Cooper', model_make_id: 'mini' },
    { model_name: 'Countryman', model_make_id: 'mini' },
    { model_name: 'Clubman', model_make_id: 'mini' },
  ],
  'mitsubishi': [
    { model_name: 'Outlander', model_make_id: 'mitsubishi' },
    { model_name: 'Eclipse Cross', model_make_id: 'mitsubishi' },
    { model_name: 'Mirage', model_make_id: 'mitsubishi' },
    { model_name: 'Outlander PHEV', model_make_id: 'mitsubishi' },
  ],
  'nissan': [
    { model_name: 'Altima', model_make_id: 'nissan' },
    { model_name: 'Rogue', model_make_id: 'nissan' },
    { model_name: 'Sentra', model_make_id: 'nissan' },
    { model_name: 'Pathfinder', model_make_id: 'nissan' },
    { model_name: 'Murano', model_make_id: 'nissan' },
    { model_name: 'Frontier', model_make_id: 'nissan' },
    { model_name: 'Maxima', model_make_id: 'nissan' },
  ],
  'porsche': [
    { model_name: '911', model_make_id: 'porsche' },
    { model_name: 'Cayenne', model_make_id: 'porsche' },
    { model_name: 'Macan', model_make_id: 'porsche' },
    { model_name: 'Panamera', model_make_id: 'porsche' },
    { model_name: 'Taycan', model_make_id: 'porsche' },
  ],
  'ram': [
    { model_name: '1500', model_make_id: 'ram' },
    { model_name: '2500', model_make_id: 'ram' },
    { model_name: '3500', model_make_id: 'ram' },
    { model_name: 'ProMaster', model_make_id: 'ram' },
  ],
  'rolls-royce': [
    { model_name: 'Phantom', model_make_id: 'rolls-royce' },
    { model_name: 'Ghost', model_make_id: 'rolls-royce' },
    { model_name: 'Cullinan', model_make_id: 'rolls-royce' },
    { model_name: 'Wraith', model_make_id: 'rolls-royce' },
    { model_name: 'Dawn', model_make_id: 'rolls-royce' },
  ],
  'subaru': [
    { model_name: 'Outback', model_make_id: 'subaru' },
    { model_name: 'Forester', model_make_id: 'subaru' },
    { model_name: 'Crosstrek', model_make_id: 'subaru' },
    { model_name: 'Impreza', model_make_id: 'subaru' },
    { model_name: 'Legacy', model_make_id: 'subaru' },
    { model_name: 'Ascent', model_make_id: 'subaru' },
  ],
  'tesla': [
    { model_name: 'Model 3', model_make_id: 'tesla' },
    { model_name: 'Model S', model_make_id: 'tesla' },
    { model_name: 'Model X', model_make_id: 'tesla' },
    { model_name: 'Model Y', model_make_id: 'tesla' },
    { model_name: 'Cybertruck', model_make_id: 'tesla' },
  ],
  'toyota': [
    { model_name: 'Camry', model_make_id: 'toyota' },
    { model_name: 'Corolla', model_make_id: 'toyota' },
    { model_name: 'RAV4', model_make_id: 'toyota' },
    { model_name: 'Highlander', model_make_id: 'toyota' },
    { model_name: 'Tacoma', model_make_id: 'toyota' },
    { model_name: '4Runner', model_make_id: 'toyota' },
    { model_name: 'Sienna', model_make_id: 'toyota' },
    { model_name: 'Tundra', model_make_id: 'toyota' },
  ],
  'volkswagen': [
    { model_name: 'Jetta', model_make_id: 'volkswagen' },
    { model_name: 'Tiguan', model_make_id: 'volkswagen' },
    { model_name: 'Atlas', model_make_id: 'volkswagen' },
    { model_name: 'Golf', model_make_id: 'volkswagen' },
    { model_name: 'Passat', model_make_id: 'volkswagen' },
    { model_name: 'ID.4', model_make_id: 'volkswagen' },
  ],
  'volvo': [
    { model_name: 'XC90', model_make_id: 'volvo' },
    { model_name: 'XC60', model_make_id: 'volvo' },
    { model_name: 'XC40', model_make_id: 'volvo' },
    { model_name: 'S60', model_make_id: 'volvo' },
    { model_name: 'S90', model_make_id: 'volvo' },
    { model_name: 'V60', model_make_id: 'volvo' },
  ],
};

// Mock VIN database - simplified for demo purposes
// Structure: VIN prefix (first 8 chars) -> vehicle info
const mockVinDatabase: Record<string, VinDecodeResult> = {
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

export const useVehicleData = () => {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Load years (from current year back to 1950)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
    setYears(yearsList);
  }, []);

  // Load makes on mount (now using mock data)
  useEffect(() => {
    setLoading(true);
    try {
      // Use our mock data instead of API
      setMakes(mockMakes);
      setLoading(false);
    } catch (err) {
      console.error("Error setting mock makes:", err);
      setError("Could not load vehicle makes");
      setLoading(false);
    }
  }, []);

  // Function to fetch models for a selected make
  const fetchModels = useCallback((make: string) => {
    if (!make) return;
    
    setLoading(true);
    setError(null);
    setSelectedMake(make);
    setSelectedModel('');
    
    try {
      // Get models from our mock data
      const modelsForMake = mockModelsByMake[make] || [];
      setModels(modelsForMake);
      setLoading(false);
    } catch (err) {
      console.error("Error setting mock models:", err);
      setError("Could not load vehicle models");
      setLoading(false);
    }
  }, []);

  // Function to decode VIN and return vehicle information
  const decodeVin = useCallback((vin: string): VinDecodeResult | null => {
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
      
      // If no exact match, return a random vehicle for demo purposes
      const randomMockVin = Object.keys(mockVinDatabase)[Math.floor(Math.random() * Object.keys(mockVinDatabase).length)];
      console.log(`No exact VIN match, using random vehicle:`, mockVinDatabase[randomMockVin]);
      return mockVinDatabase[randomMockVin];
      
    } catch (err) {
      console.error("Error decoding VIN:", err);
      return null;
    }
  }, []);

  return {
    makes,
    models,
    years,
    loading,
    error,
    selectedMake,
    selectedModel,
    selectedYear,
    setSelectedModel,
    setSelectedYear,
    fetchModels,
    decodeVin
  };
};
