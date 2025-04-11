
export type VehicleBodyStyle = 
  | 'sedan'
  | 'suv'
  | 'truck'
  | 'coupe'
  | 'hatchback'
  | 'wagon'
  | 'van'
  | 'convertible'
  | 'minivan'
  | 'crossover'
  | 'pickup'
  | 'bus'
  | 'motorcycle'
  | 'off-road'
  | 'other';

// Export a list of all available body styles for UI components to use
export const VEHICLE_BODY_STYLES: {value: VehicleBodyStyle; label: string}[] = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Truck' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'van', label: 'Van' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'crossover', label: 'Crossover' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'bus', label: 'Bus' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'off-road', label: 'Off-Road' },
  { value: 'other', label: 'Other' }
];
