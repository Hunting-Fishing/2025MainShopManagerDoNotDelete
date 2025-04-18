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
    { name: 'Daewoo', flag: '🇰🇷', country: 'South Korea', founded: 1967 },
    
    // China
    { name: 'BYD', flag: '🇨🇳', country: 'China', founded: 1995 },
    { name: 'Changan', flag: '🇨🇳', country: 'China', founded: 1862 },
    { name: 'Chery', flag: '🇨🇳', country: 'China', founded: 1997 },
    { name: 'DFSK', flag: '🇨🇳', country: 'China', founded: 2003 },
    { name: 'FAW', flag: '🇨🇳', country: 'China', founded: 1953 },
    { name: 'Foton', flag: '🇨🇳', country: 'China', founded: 1996 },
    { name: 'Geely', flag: '🇨🇳', country: 'China', founded: 1986 },
    { name: 'Great Wall', flag: '🇨🇳', country: 'China', founded: 1984 },
    { name: 'Haval', flag: '🇨🇳', country: 'China', founded: 2013 },
    { name: 'Hongqi', flag: '🇨🇳', country: 'China', founded: 1958 },
    { name: 'JAC', flag: '🇨🇳', country: 'China', founded: 1964 },
    { name: 'Lifan', flag: '🇨🇳', country: 'China', founded: 1992 },
    { name: 'MG', flag: '🇨🇳', country: 'China', founded: 1924 },
    { name: 'NIO', flag: '🇨🇳', country: 'China', founded: 2014 },
    { name: 'SAIC', flag: '🇨🇳', country: 'China', founded: 1955 },
    { name: 'Wey', flag: '🇨🇳', country: 'China', founded: 2016 },
    { name: 'Xpeng', flag: '🇨🇳', country: 'China', founded: 2014 },
    { name: 'Zeekr', flag: '🇨🇳', country: 'China', founded: 2021 },
    
    // India
    { name: 'Force', flag: '🇮🇳', country: 'India', founded: 1958 },
    { name: 'Hindustan', flag: '🇮🇳', country: 'India', founded: 1942 },
    { name: 'Mahindra', flag: '🇮🇳', country: 'India', founded: 1945 },
    { name: 'Maruti Suzuki', flag: '🇮🇳', country: 'India', founded: 1981 },
    { name: 'Tata', flag: '🇮🇳', country: 'India', founded: 1945 },
    
    // Other Asian
    { name: 'Perodua', flag: '🇲🇾', country: 'Malaysia', founded: 1993 },
    { name: 'Proton', flag: '🇲🇾', country: 'Malaysia', founded: 1983 },
    { name: 'VinFast', flag: '🇻🇳', country: 'Vietnam', founded: 2017 }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  northAmerican: [
    // USA
    { name: 'Buick', flag: '🇺🇸', country: 'USA', founded: 1903 },
    { name: 'Cadillac', flag: '🇺🇸', country: 'USA', founded: 1902 },
    { name: 'Chevrolet', flag: '🇺🇸', country: 'USA', founded: 1911 },
    { name: 'Chrysler', flag: '🇺🇸', country: 'USA', founded: 1925 },
    { name: 'DeLorean', flag: '🇺🇸', country: 'USA', founded: 1975 },
    { name: 'Dodge', flag: '🇺🇸', country: 'USA', founded: 1900 },
    { name: 'Eagle', flag: '🇺🇸', country: 'USA', founded: 1988 },
    { name: 'Ford', flag: '🇺🇸', country: 'USA', founded: 1903 },
    { name: 'GMC', flag: '🇺🇸', country: 'USA', founded: 1911 },
    { name: 'Hummer', flag: '🇺🇸', country: 'USA', founded: 1992 },
    { name: 'Jeep', flag: '🇺🇸', country: 'USA', founded: 1941 },
    { name: 'Lincoln', flag: '🇺🇸', country: 'USA', founded: 1917 },
    { name: 'Mercury', flag: '🇺🇸', country: 'USA', founded: 1938 },
    { name: 'Oldsmobile', flag: '🇺🇸', country: 'USA', founded: 1897 },
    { name: 'Packard', flag: '🇺🇸', country: 'USA', founded: 1899 },
    { name: 'Plymouth', flag: '🇺🇸', country: 'USA', founded: 1928 },
    { name: 'Pontiac', flag: '🇺🇸', country: 'USA', founded: 1926 },
    { name: 'Ram', flag: '🇺🇸', country: 'USA', founded: 2010 },
    { name: 'Saturn', flag: '🇺🇸', country: 'USA', founded: 1985 },
    { name: 'Studebaker', flag: '🇺🇸', country: 'USA', founded: 1852 },
    { name: 'Tesla', flag: '🇺🇸', country: 'USA', founded: 2003 },
    
    // Canada
    { name: 'Bricklin', flag: '🇨🇦', country: 'Canada', founded: 1974 }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  european: [
    // Germany
    { name: 'Alpina', flag: '🇩🇪', country: 'Germany', founded: 1965 },
    { name: 'Artega', flag: '🇩🇪', country: 'Germany', founded: 2006 },
    { name: 'Audi', flag: '🇩🇪', country: 'Germany', founded: 1909 },
    { name: 'BMW', flag: '🇩🇪', country: 'Germany', founded: 1916 },
    { name: 'Gumpert', flag: '🇩🇪', country: 'Germany', founded: 2004 },
    { name: 'Maybach', flag: '🇩🇪', country: 'Germany', founded: 1909 },
    { name: 'Mercedes-Benz', flag: '🇩🇪', country: 'Germany', founded: 1926 },
    { name: 'Opel', flag: '🇩🇪', country: 'Germany', founded: 1862 },
    { name: 'Porsche', flag: '🇩🇪', country: 'Germany', founded: 1931 },
    { name: 'Smart', flag: '🇩🇪', country: 'Germany', founded: 1994 },
    { name: 'Volkswagen', flag: '🇩🇪', country: 'Germany', founded: 1937 },
    { name: 'Wiesmann', flag: '🇩🇪', country: 'Germany', founded: 1988 },
    
    // Italy
    { name: 'Alfa Romeo', flag: '🇮🇹', country: 'Italy', founded: 1910 },
    { name: 'Ferrari', flag: '🇮🇹', country: 'Italy', founded: 1947 },
    { name: 'Fiat', flag: '🇮🇹', country: 'Italy', founded: 1899 },
    { name: 'Lamborghini', flag: '🇮🇹', country: 'Italy', founded: 1963 },
    { name: 'Lancia', flag: '🇮🇹', country: 'Italy', founded: 1906 },
    { name: 'Maserati', flag: '🇮🇹', country: 'Italy', founded: 1914 },
    { name: 'Pagani', flag: '🇮🇹', country: 'Italy', founded: 1992 },
    
    // France
    { name: 'Alpine', flag: '🇫🇷', country: 'France', founded: 1955 },
    { name: 'Bugatti', flag: '🇫🇷', country: 'France', founded: 1909 },
    { name: 'Citroën', flag: '🇫🇷', country: 'France', founded: 1919 },
    { name: 'DS', flag: '🇫🇷', country: 'France', founded: 2014 },
    { name: 'Peugeot', flag: '🇫🇷', country: 'France', founded: 1810 },
    { name: 'Renault', flag: '🇫🇷', country: 'France', founded: 1899 },
    { name: 'Venturi', flag: '🇫🇷', country: 'France', founded: 1984 },
    
    // UK
    { name: 'Aston Martin', flag: '🇬🇧', country: 'UK', founded: 1913 },
    { name: 'Bentley', flag: '🇬🇧', country: 'UK', founded: 1919 },
    { name: 'Caterham', flag: '🇬🇧', country: 'UK', founded: 1973 },
    { name: 'Jaguar', flag: '🇬🇧', country: 'UK', founded: 1922 },
    { name: 'Land Rover', flag: '🇬🇧', country: 'UK', founded: 1948 },
    { name: 'Lotus', flag: '🇬🇧', country: 'UK', founded: 1952 },
    { name: 'McLaren', flag: '🇬🇧', country: 'UK', founded: 1963 },
    { name: 'Mini', flag: '🇬🇧', country: 'UK', founded: 1959 },
    { name: 'Morgan', flag: '🇬🇧', country: 'UK', founded: 1910 },
    { name: 'Noble', flag: '🇬🇧', country: 'UK', founded: 1999 },
    { name: 'Rolls-Royce', flag: '🇬🇧', country: 'UK', founded: 1904 },
    { name: 'TVR', flag: '🇬🇧', country: 'UK', founded: 1946 },
    
    // Sweden
    { name: 'Koenigsegg', flag: '🇸🇪', country: 'Sweden', founded: 1994 },
    { name: 'Polestar', flag: '🇸🇪', country: 'Sweden', founded: 1996 },
    { name: 'Saab', flag: '🇸🇪', country: 'Sweden', founded: 1945 },
    { name: 'Volvo', flag: '🇸🇪', country: 'Sweden', founded: 1927 },
    
    // Netherlands
    { name: 'Donkervoort', flag: '🇳🇱', country: 'Netherlands', founded: 1978 },
    { name: 'Spyker', flag: '🇳🇱', country: 'Netherlands', founded: 1880 },
    
    // Spain
    { name: 'SEAT', flag: '🇪🇸', country: 'Spain', founded: 1950 },
    { name: 'Cupra', flag: '🇪🇸', country: 'Spain', founded: 2018 },
    
    // Czech Republic
    { name: 'Škoda', flag: '🇨🇿', country: 'Czech Republic', founded: 1895 },
    { name: 'Tatra', flag: '🇨🇿', country: 'Czech Republic', founded: 1850 },
    
    // Romania
    { name: 'Dacia', flag: '🇷🇴', country: 'Romania', founded: 1966 },
    
    // Croatia
    { name: 'Rimac', flag: '🇭🇷', country: 'Croatia', founded: 2009 }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  electricAndOther: [
    // Electric Vehicle Manufacturers
    { name: 'Arrival', flag: '🇬🇧', country: 'UK', founded: 2015 },
    { name: 'BYD', flag: '🇨🇳', country: 'China', founded: 1995 },
    { name: 'Canoo', flag: '🇺🇸', country: 'USA', founded: 2017 },
    { name: 'Faraday Future', flag: '🇺🇸', country: 'USA', founded: 2014 },
    { name: 'Fisker', flag: '🇺🇸', country: 'USA', founded: 2007 },
    { name: 'Karma', flag: '🇺🇸', country: 'USA', founded: 2015 },
    { name: 'Li Auto', flag: '🇨🇳', country: 'China', founded: 2015 },
    { name: 'Lordstown', flag: '🇺🇸', country: 'USA', founded: 2018 },
    { name: 'Lucid', flag: '🇺🇸', country: 'USA', founded: 2007 },
    { name: 'NIO', flag: '🇨🇳', country: 'China', founded: 2014 },
    { name: 'Polestar', flag: '🇸🇪', country: 'Sweden', founded: 1996 },
    { name: 'Rimac', flag: '🇭🇷', country: 'Croatia', founded: 2009 },
    { name: 'Rivian', flag: '🇺🇸', country: 'USA', founded: 2009 },
    { name: 'Tesla', flag: '🇺🇸', country: 'USA', founded: 2003 },
    { name: 'VinFast', flag: '🇻🇳', country: 'Vietnam', founded: 2017 },
    { name: 'Xpeng', flag: '🇨🇳', country: 'China', founded: 2014 }
  ].sort((a, b) => a.name.localeCompare(b.name))
};

export const getAllVehicleManufacturers = () => {
  const allManufacturers: string[] = [];
  
  Object.values(vehicleManufacturers).forEach(categoryManufacturers => {
    categoryManufacturers.forEach(manufacturer => {
      allManufacturers.push(`${manufacturer.flag} ${manufacturer.name}`);
    });
  });
  
  return allManufacturers.sort();
};
