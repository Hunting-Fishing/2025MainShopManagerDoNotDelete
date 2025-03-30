
import { useState, useEffect } from 'react';

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

// Mock models data by make
const mockModelsByMake: Record<string, CarModel[]> = {
  'acura': [
    { model_name: 'ILX', model_make_id: 'acura' },
    { model_name: 'MDX', model_make_id: 'acura' },
    { model_name: 'RDX', model_make_id: 'acura' },
    { model_name: 'TLX', model_make_id: 'acura' },
  ],
  'honda': [
    { model_name: 'Accord', model_make_id: 'honda' },
    { model_name: 'Civic', model_make_id: 'honda' },
    { model_name: 'CR-V', model_make_id: 'honda' },
    { model_name: 'Pilot', model_make_id: 'honda' },
    { model_name: 'Odyssey', model_make_id: 'honda' },
  ],
  'toyota': [
    { model_name: 'Camry', model_make_id: 'toyota' },
    { model_name: 'Corolla', model_make_id: 'toyota' },
    { model_name: 'RAV4', model_make_id: 'toyota' },
    { model_name: 'Highlander', model_make_id: 'toyota' },
    { model_name: 'Tacoma', model_make_id: 'toyota' },
  ],
  'ford': [
    { model_name: 'F-150', model_make_id: 'ford' },
    { model_name: 'Escape', model_make_id: 'ford' },
    { model_name: 'Explorer', model_make_id: 'ford' },
    { model_name: 'Mustang', model_make_id: 'ford' },
    { model_name: 'Edge', model_make_id: 'ford' },
  ],
  'chevrolet': [
    { model_name: 'Silverado', model_make_id: 'chevrolet' },
    { model_name: 'Equinox', model_make_id: 'chevrolet' },
    { model_name: 'Malibu', model_make_id: 'chevrolet' },
    { model_name: 'Traverse', model_make_id: 'chevrolet' },
    { model_name: 'Tahoe', model_make_id: 'chevrolet' },
  ],
};

// Add default empty arrays for makes not explicitly defined
Object.keys(mockMakes).forEach(make => {
  if (!mockModelsByMake[make]) {
    mockModelsByMake[make] = [];
  }
});

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
  const fetchModels = (make: string) => {
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
  };

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
    fetchModels
  };
};
