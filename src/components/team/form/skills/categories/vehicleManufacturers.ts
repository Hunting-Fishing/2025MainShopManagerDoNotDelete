
interface VehicleManufacturer {
  name: string;
  flag: string;
  country?: string;
  founded?: number;
  specialties?: string[];
}

export const vehicleManufacturers: Record<string, VehicleManufacturer[]> = {
  asian: [
    // Japan
    { name: 'Acura', flag: '🇯🇵', country: 'Japan', founded: 1986 },
    { name: 'Daihatsu', flag: '🇯🇵', country: 'Japan', founded: 1907 },
    { name: 'Honda', flag: '🇯🇵', country: 'Japan', founded: 1946 },
    { name: 'Infiniti', flag: '🇯🇵', country: 'Japan', founded: 1989 },
    { name: 'Isuzu', flag: '🇯🇵', country: 'Japan', founded: 1916 },
    { name: 'Lexus', flag: '🇯🇵', country: 'Japan', founded: 1989 },
    { name: 'Mazda', flag: '🇯🇵', country: 'Japan', founded: 1920 },
    { name: 'Mitsubishi', flag: '🇯🇵', country: 'Japan', founded: 1870 },
    { name: 'Nissan', flag: '🇯🇵', country: 'Japan', founded: 1933 },
    { name: 'Subaru', flag: '🇯🇵', country: 'Japan', founded: 1953 },
    { name: 'Suzuki', flag: '🇯🇵', country: 'Japan', founded: 1909 },
    { name: 'Toyota', flag: '🇯🇵', country: 'Japan', founded: 1937 },
    
    // South Korea
    { name: 'Genesis', flag: '🇰🇷', country: 'South Korea', founded: 2015 },
    { name: 'Hyundai', flag: '🇰🇷', country: 'South Korea', founded: 1967 },
    { name: 'Kia', flag: '🇰🇷', country: 'South Korea', founded: 1944 },
    { name: 'SsangYong', flag: '🇰🇷', country: 'South Korea', founded: 1954 },
    
    // China
    { name: 'BYD', flag: '🇨🇳', country: 'China', founded: 1995 },
    { name: 'Chery', flag: '🇨🇳', country: 'China', founded: 1997 },
    { name: 'DFSK', flag: '🇨🇳', country: 'China', founded: 2003 },
    { name: 'Geely', flag: '🇨🇳', country: 'China', founded: 1986 },
    { name: 'Great Wall', flag: '🇨🇳', country: 'China', founded: 1984 },
    { name: 'MG', flag: '🇨🇳', country: 'China', founded: 1924 },
    { name: 'NIO', flag: '🇨🇳', country: 'China', founded: 2014 },
    { name: 'SAIC', flag: '🇨🇳', country: 'China', founded: 1955 },
    { name: 'Xpeng', flag: '🇨🇳', country: 'China', founded: 2014 }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  northAmerican: [
    // USA
    { name: 'Cadillac', flag: '🇺🇸', country: 'USA', founded: 1902 },
    { name: 'Chevrolet', flag: '🇺🇸', country: 'USA', founded: 1911 },
    { name: 'Chrysler', flag: '🇺🇸', country: 'USA', founded: 1925 },
    { name: 'Dodge', flag: '🇺🇸', country: 'USA', founded: 1900 },
    { name: 'Ford', flag: '🇺🇸', country: 'USA', founded: 1903 },
    { name: 'GMC', flag: '🇺🇸', country: 'USA', founded: 1911 },
    { name: 'Jeep', flag: '🇺🇸', country: 'USA', founded: 1941 },
    { name: 'Lincoln', flag: '🇺🇸', country: 'USA', founded: 1917 },
    { name: 'Ram', flag: '🇺🇸', country: 'USA', founded: 2010 },
    { name: 'Rivian', flag: '🇺🇸', country: 'USA', founded: 2009 },
    { name: 'Tesla', flag: '🇺🇸', country: 'USA', founded: 2003 }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  european: [
    // Germany
    { name: 'Audi', flag: '🇩🇪', country: 'Germany', founded: 1909 },
    { name: 'BMW', flag: '🇩🇪', country: 'Germany', founded: 1916 },
    { name: 'Mercedes-Benz', flag: '🇩🇪', country: 'Germany', founded: 1926 },
    { name: 'Mini', flag: '🇩🇪', country: 'Germany', founded: 1959 },
    { name: 'Opel', flag: '🇩🇪', country: 'Germany', founded: 1862 },
    { name: 'Porsche', flag: '🇩🇪', country: 'Germany', founded: 1931 },
    { name: 'Volkswagen', flag: '🇩🇪', country: 'Germany', founded: 1937 },
    
    // Italy
    { name: 'Alfa Romeo', flag: '🇮🇹', country: 'Italy', founded: 1910 },
    { name: 'Ferrari', flag: '🇮🇹', country: 'Italy', founded: 1947 },
    { name: 'Fiat', flag: '🇮🇹', country: 'Italy', founded: 1899 },
    { name: 'Lamborghini', flag: '🇮🇹', country: 'Italy', founded: 1963 },
    { name: 'Maserati', flag: '🇮🇹', country: 'Italy', founded: 1914 },
    
    // France
    { name: 'Citroën', flag: '🇫🇷', country: 'France', founded: 1919 },
    { name: 'Peugeot', flag: '🇫🇷', country: 'France', founded: 1810 },
    { name: 'Renault', flag: '🇫🇷', country: 'France', founded: 1899 },
    
    // UK
    { name: 'Aston Martin', flag: '🇬🇧', country: 'UK', founded: 1913 },
    { name: 'Bentley', flag: '🇬🇧', country: 'UK', founded: 1919 },
    { name: 'Jaguar', flag: '🇬🇧', country: 'UK', founded: 1922 },
    { name: 'Land Rover', flag: '🇬🇧', country: 'UK', founded: 1948 },
    { name: 'Lotus', flag: '🇬🇧', country: 'UK', founded: 1948 },
    { name: 'McLaren', flag: '🇬🇧', country: 'UK', founded: 1963 },
    { name: 'Rolls-Royce', flag: '🇬🇧', country: 'UK', founded: 1904 },
    
    // Sweden
    { name: 'Polestar', flag: '🇸🇪', country: 'Sweden', founded: 1996 },
    { name: 'Volvo', flag: '🇸🇪', country: 'Sweden', founded: 1927 }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  electricAndOther: [
    { name: 'BYD', flag: '🇨🇳', country: 'China', founded: 1995 },
    { name: 'Lucid', flag: '🇺🇸', country: 'USA', founded: 2007 },
    { name: 'NIO', flag: '🇨🇳', country: 'China', founded: 2014 },
    { name: 'Polestar', flag: '🇸🇪', country: 'Sweden', founded: 1996 },
    { name: 'Rivian', flag: '🇺🇸', country: 'USA', founded: 2009 },
    { name: 'Tesla', flag: '🇺🇸', country: 'USA', founded: 2003 },
    { name: 'VinFast', flag: '🇻🇳', country: 'Vietnam', founded: 2017 },
    { name: 'Xpeng', flag: '🇨🇳', country: 'China', founded: 2014 }
  ].sort((a, b) => a.name.localeCompare(b.name))
};

// Add this function to get all vehicle manufacturers
export const getAllVehicleManufacturers = () => {
  const allManufacturers: string[] = [];
  
  Object.values(vehicleManufacturers).forEach(categoryManufacturers => {
    categoryManufacturers.forEach(manufacturer => {
      allManufacturers.push(`${manufacturer.flag} ${manufacturer.name}`);
    });
  });
  
  return allManufacturers.sort();
};
