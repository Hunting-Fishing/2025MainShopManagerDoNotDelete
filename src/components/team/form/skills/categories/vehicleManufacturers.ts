interface VehicleManufacturer {
  name: string;
  flag: string;
  country?: string;
}

interface RegionalManufacturers {
  [key: string]: VehicleManufacturer[];
}

export const vehicleManufacturers: Record<string, VehicleManufacturer[]> = {
  asian: [
    // China
    { name: 'BYD', flag: '🇨🇳', country: 'China' },
    { name: 'Geely', flag: '🇨🇳', country: 'China' },
    { name: 'Great Wall', flag: '🇨🇳', country: 'China' },
    { name: 'NIO', flag: '🇨🇳', country: 'China' },
    { name: 'XPeng', flag: '🇨🇳', country: 'China' },
    { name: 'Li Auto', flag: '🇨🇳', country: 'China' },
    { name: 'SAIC', flag: '🇨🇳', country: 'China' },
    { name: 'Chery', flag: '🇨🇳', country: 'China' },
    // Japan
    { name: 'Toyota', flag: '🇯🇵', country: 'Japan' },
    { name: 'Honda', flag: '🇯🇵', country: 'Japan' },
    { name: 'Nissan', flag: '🇯🇵', country: 'Japan' },
    { name: 'Suzuki', flag: '🇯🇵', country: 'Japan' },
    { name: 'Mazda', flag: '🇯🇵', country: 'Japan' },
    { name: 'Mitsubishi', flag: '🇯🇵', country: 'Japan' },
    { name: 'Subaru', flag: '🇯🇵', country: 'Japan' },
    // South Korea
    { name: 'Hyundai', flag: '🇰🇷', country: 'South Korea' },
    { name: 'Kia', flag: '🇰🇷', country: 'South Korea' },
    { name: 'Genesis', flag: '🇰🇷', country: 'South Korea' },
    // India
    { name: 'Tata Motors', flag: '🇮🇳', country: 'India' },
    { name: 'Mahindra', flag: '🇮🇳', country: 'India' },
    { name: 'Maruti Suzuki', flag: '🇮🇳', country: 'India' },
    // Other Asian
    { name: 'VinFast', flag: '🇻🇳', country: 'Vietnam' },
    { name: 'Proton', flag: '🇲🇾', country: 'Malaysia' },
    { name: 'Perodua', flag: '🇲🇾', country: 'Malaysia' }
  ],

  northAmerican: [
    // USA
    { name: 'Ford', flag: '🇺🇸', country: 'USA' },
    { name: 'Chevrolet', flag: '🇺🇸', country: 'USA' },
    { name: 'GMC', flag: '🇺🇸', country: 'USA' },
    { name: 'Cadillac', flag: '🇺🇸', country: 'USA' },
    { name: 'Buick', flag: '🇺🇸', country: 'USA' },
    { name: 'Ram', flag: '🇺🇸', country: 'USA' },
    { name: 'Jeep', flag: '🇺🇸', country: 'USA' },
    { name: 'Tesla', flag: '🇺🇸', country: 'USA' },
    { name: 'Rivian', flag: '🇺🇸', country: 'USA' },
    { name: 'Lucid', flag: '🇺🇸', country: 'USA' },
    // Canada
    { name: 'Lion Electric', flag: '🇨🇦', country: 'Canada' }
  ],

  european: [
    // Germany
    { name: 'Volkswagen', flag: '🇩🇪', country: 'Germany' },
    { name: 'Audi', flag: '🇩🇪', country: 'Germany' },
    { name: 'BMW', flag: '🇩🇪', country: 'Germany' },
    { name: 'Mercedes-Benz', flag: '🇩🇪', country: 'Germany' },
    { name: 'Porsche', flag: '🇩🇪', country: 'Germany' },
    // UK
    { name: 'Jaguar', flag: '🇬🇧', country: 'UK' },
    { name: 'Land Rover', flag: '🇬🇧', country: 'UK' },
    { name: 'Aston Martin', flag: '🇬🇧', country: 'UK' },
    { name: 'Bentley', flag: '🇬🇧', country: 'UK' },
    { name: 'McLaren', flag: '🇬🇧', country: 'UK' },
    { name: 'Rolls-Royce', flag: '🇬🇧', country: 'UK' },
    // Italy
    { name: 'Ferrari', flag: '🇮🇹', country: 'Italy' },
    { name: 'Lamborghini', flag: '🇮🇹', country: 'Italy' },
    { name: 'Maserati', flag: '🇮🇹', country: 'Italy' },
    { name: 'Alfa Romeo', flag: '🇮🇹', country: 'Italy' },
    { name: 'Fiat', flag: '🇮🇹', country: 'Italy' },
    // France
    { name: 'Renault', flag: '🇫🇷', country: 'France' },
    { name: 'Peugeot', flag: '🇫🇷', country: 'France' },
    { name: 'Citroën', flag: '🇫🇷', country: 'France' },
    // Sweden
    { name: 'Volvo', flag: '🇸🇪', country: 'Sweden' },
    { name: 'Polestar', flag: '🇸🇪', country: 'Sweden' }
  ],

  electricAndOther: [
    { name: 'NIO', flag: '🇨🇳', country: 'China' },
    { name: 'XPeng', flag: '🇨🇳', country: 'China' },
    { name: 'Tesla', flag: '🇺🇸', country: 'USA' },
    { name: 'Rivian', flag: '🇺🇸', country: 'USA' },
    { name: 'Lucid', flag: '🇺🇸', country: 'USA' },
    { name: 'Polestar', flag: '🇸🇪', country: 'Sweden' },
    { name: 'VinFast', flag: '🇻🇳', country: 'Vietnam' }
  ]
};

// Function to get vehicle display name with flag
const getVehicleDisplayName = (manufacturer: VehicleManufacturer): string => {
  return `${manufacturer.flag} ${manufacturer.name}`;
};

// Update getAllVehicleManufacturers to return display names with flags
export const getAllVehicleManufacturers = () => {
  const allManufacturers = new Set<string>();
  
  Object.values(vehicleManufacturers).forEach(manufacturers => {
    manufacturers.forEach(manufacturer => {
      allManufacturers.add(getVehicleDisplayName(manufacturer));
    });
  });
  
  return Array.from(allManufacturers).sort((a, b) => a.localeCompare(b));
};
