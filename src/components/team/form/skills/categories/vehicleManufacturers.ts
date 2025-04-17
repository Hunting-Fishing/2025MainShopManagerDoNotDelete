
interface VehicleManufacturer {
  name: string;
  flag: string;
  country?: string;
}

export const vehicleManufacturers: Record<string, VehicleManufacturer[]> = {
  asian: [
    // China
    { name: 'BAIC Group', flag: '🇨🇳', country: 'China' },
    { name: 'BYD', flag: '🇨🇳', country: 'China' },
    { name: 'Changan', flag: '🇨🇳', country: 'China' },
    { name: 'Chery', flag: '🇨🇳', country: 'China' },
    { name: 'Dongfeng', flag: '🇨🇳', country: 'China' },
    { name: 'FAW Group', flag: '🇨🇳', country: 'China' },
    { name: 'Geely', flag: '🇨🇳', country: 'China' },
    { name: 'Great Wall Motors', flag: '🇨🇳', country: 'China' },
    { name: 'Hongqi', flag: '🇨🇳', country: 'China' },
    { name: 'Leapmotor', flag: '🇨🇳', country: 'China' },
    { name: 'Li Auto', flag: '🇨🇳', country: 'China' },
    { name: 'NIO', flag: '🇨🇳', country: 'China' },
    { name: 'Ora', flag: '🇨🇳', country: 'China' },
    { name: 'SAIC Motor', flag: '🇨🇳', country: 'China' },
    { name: 'Wuling', flag: '🇨🇳', country: 'China' },
    { name: 'XPeng', flag: '🇨🇳', country: 'China' },
    { name: 'Zeekr', flag: '🇨🇳', country: 'China' },
    // Japan
    { name: 'Daihatsu', flag: '🇯🇵', country: 'Japan' },
    { name: 'Honda', flag: '🇯🇵', country: 'Japan' },
    { name: 'Isuzu', flag: '🇯🇵', country: 'Japan' },
    { name: 'Mazda', flag: '🇯🇵', country: 'Japan' },
    { name: 'Mitsubishi', flag: '🇯🇵', country: 'Japan' },
    { name: 'Nissan', flag: '🇯🇵', country: 'Japan' },
    { name: 'Subaru', flag: '🇯🇵', country: 'Japan' },
    { name: 'Suzuki', flag: '🇯🇵', country: 'Japan' },
    { name: 'Toyota', flag: '🇯🇵', country: 'Japan' },
    // South Korea
    { name: 'Genesis', flag: '🇰🇷', country: 'South Korea' },
    { name: 'Hyundai', flag: '🇰🇷', country: 'South Korea' },
    { name: 'Kia', flag: '🇰🇷', country: 'South Korea' },
    { name: 'SsangYong', flag: '🇰🇷', country: 'South Korea' },
    // India
    { name: 'Ashok Leyland', flag: '🇮🇳', country: 'India' },
    { name: 'Mahindra', flag: '🇮🇳', country: 'India' },
    { name: 'Maruti Suzuki', flag: '🇮🇳', country: 'India' },
    { name: 'Tata Motors', flag: '🇮🇳', country: 'India' },
    // Southeast Asia
    { name: 'Proton', flag: '🇲🇾', country: 'Malaysia' },
    { name: 'Perodua', flag: '🇲🇾', country: 'Malaysia' },
    { name: 'VinFast', flag: '🇻🇳', country: 'Vietnam' }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  northAmerican: [
    // USA
    { name: 'Bollinger Motors', flag: '🇺🇸', country: 'USA' },
    { name: 'Buick', flag: '🇺🇸', country: 'USA' },
    { name: 'Cadillac', flag: '🇺🇸', country: 'USA' },
    { name: 'Canoo', flag: '🇺🇸', country: 'USA' },
    { name: 'Chevrolet', flag: '🇺🇸', country: 'USA' },
    { name: 'Fisker', flag: '🇺🇸', country: 'USA' },
    { name: 'Ford', flag: '🇺🇸', country: 'USA' },
    { name: 'GMC', flag: '🇺🇸', country: 'USA' },
    { name: 'Lordstown Motors', flag: '🇺🇸', country: 'USA' },
    { name: 'Lucid Motors', flag: '🇺🇸', country: 'USA' },
    { name: 'Rivian', flag: '🇺🇸', country: 'USA' },
    { name: 'Tesla', flag: '🇺🇸', country: 'USA' },
    // Canada
    { name: 'Lion Electric', flag: '🇨🇦', country: 'Canada' },
    // Mexico
    { name: 'Mastretta', flag: '🇲🇽', country: 'Mexico' }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  european: [
    // Germany
    { name: 'Audi', flag: '🇩🇪', country: 'Germany' },
    { name: 'BMW', flag: '🇩🇪', country: 'Germany' },
    { name: 'Mercedes-Benz', flag: '🇩🇪', country: 'Germany' },
    { name: 'Porsche', flag: '🇩🇪', country: 'Germany' },
    { name: 'Volkswagen', flag: '🇩🇪', country: 'Germany' },
    // UK
    { name: 'Aston Martin', flag: '🇬🇧', country: 'UK' },
    { name: 'Bentley', flag: '🇬🇧', country: 'UK' },
    { name: 'Jaguar', flag: '🇬🇧', country: 'UK' },
    { name: 'Land Rover', flag: '🇬🇧', country: 'UK' },
    { name: 'McLaren', flag: '🇬🇧', country: 'UK' },
    { name: 'MINI', flag: '🇬🇧', country: 'UK' },
    { name: 'Rolls-Royce', flag: '🇬🇧', country: 'UK' },
    // Italy
    { name: 'Alfa Romeo', flag: '🇮🇹', country: 'Italy' },
    { name: 'Ferrari', flag: '🇮🇹', country: 'Italy' },
    { name: 'Fiat', flag: '🇮🇹', country: 'Italy' },
    { name: 'Lamborghini', flag: '🇮🇹', country: 'Italy' },
    { name: 'Lancia', flag: '🇮🇹', country: 'Italy' },
    { name: 'Maserati', flag: '🇮🇹', country: 'Italy' },
    // France
    { name: 'Citroën', flag: '🇫🇷', country: 'France' },
    { name: 'DS Automobiles', flag: '🇫🇷', country: 'France' },
    { name: 'Peugeot', flag: '🇫🇷', country: 'France' },
    { name: 'Renault', flag: '🇫🇷', country: 'France' },
    // Sweden
    { name: 'Polestar', flag: '🇸🇪', country: 'Sweden' },
    { name: 'Scania', flag: '🇸🇪', country: 'Sweden' },
    { name: 'Volvo', flag: '🇸🇪', country: 'Sweden' }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  electricAndOther: [
    // Electric & New Tech Focused
    { name: 'BYD', flag: '🇨🇳', country: 'China' },
    { name: 'Lucid Motors', flag: '🇺🇸', country: 'USA' },
    { name: 'NIO', flag: '🇨🇳', country: 'China' },
    { name: 'Polestar', flag: '🇸🇪', country: 'Sweden' },
    { name: 'Rivian', flag: '🇺🇸', country: 'USA' },
    { name: 'Tesla', flag: '🇺🇸', country: 'USA' },
    { name: 'VinFast', flag: '🇻🇳', country: 'Vietnam' },
    { name: 'XPeng', flag: '🇨🇳', country: 'China' }
  ].sort((a, b) => a.name.localeCompare(b.name))
};

// Function to get all manufacturers with flags in alphabetical order
export const getAllVehicleManufacturers = () => {
  const allManufacturers = new Set<string>();
  
  Object.values(vehicleManufacturers).forEach(manufacturers => {
    manufacturers.forEach(manufacturer => {
      allManufacturers.add(`${manufacturer.flag} ${manufacturer.name}`);
    });
  });
  
  return Array.from(allManufacturers).sort((a, b) => a.localeCompare(b));
};
