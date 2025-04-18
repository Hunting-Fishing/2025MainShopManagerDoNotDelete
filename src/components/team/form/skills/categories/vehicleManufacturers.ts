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
    { name: 'Chery', flag: '🇨🇳', country: 'China', founded: 1997 },
    { name: 'DFSK', flag: '🇨🇳', country: 'China', founded: 2003 },
    { name: 'Geely', flag: '🇨🇳', country: 'China', founded: 1986 },
    { name: 'Great Wall', flag: '🇨🇳', country: 'China', founded: 1984 },
    { name: 'MG', flag: '🇨🇳', country: 'China', founded: 1924 },
    { name: 'NIO', flag: '🇨🇳', country: 'China', founded: 2014 },
    { name: 'SAIC', flag: '🇨🇳', country: 'China', founded: 1955 },
    { name: 'Xpeng', flag: '🇨🇳', country: 'China', founded: 2014 },
    { name: 'FAW', flag: '🇨🇳', country: 'China', founded: 1953 },
    { name: 'Haval', flag: '🇨🇳', country: 'China', founded: 2013 },
    { name: 'Hongqi', flag: '🇨🇳', country: 'China', founded: 1958 },
    { name: 'Wey', flag: '🇨🇳', country: 'China', founded: 2016 },
    { name: 'Zeekr', flag: '🇨🇳', country: 'China', founded: 2021 },
    
    // Other Asian
    { name: 'Perodua', flag: '🇲🇾', country: 'Malaysia', founded: 1993 },
    { name: 'Proton', flag: '🇲🇾', country: 'Malaysia', founded: 1983 },
    { name: 'Tata', flag: '🇮🇳', country: 'India', founded: 1945 },
    { name: 'Mahindra', flag: '🇮🇳', country: 'India', founded: 1945 },
    { name: 'Maruti Suzuki', flag: '🇮🇳', country: 'India', founded: 1981 }
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
    { name: 'Tesla', flag: '🇺🇸', country: 'USA', founded: 2003 },
    { name: 'Buick', flag: '🇺🇸', country: 'USA', founded: 1903 },
    { name: 'Eagle', flag: '🇺🇸', country: 'USA', founded: 1988 },
    { name: 'Fisker', flag: '🇺🇸', country: 'USA', founded: 2007 },
    { name: 'Hummer', flag: '🇺🇸', country: 'USA', founded: 1992 },
    { name: 'Mercury', flag: '🇺🇸', country: 'USA', founded: 1938 },
    { name: 'Oldsmobile', flag: '🇺🇸', country: 'USA', founded: 1897 },
    { name: 'Plymouth', flag: '🇺🇸', country: 'USA', founded: 1928 },
    { name: 'Pontiac', flag: '🇺🇸', country: 'USA', founded: 1926 },
    { name: 'Saturn', flag: '🇺🇸', country: 'USA', founded: 1985 },
    
    // Additional US manufacturers
    { name: 'Karma', flag: '🇺🇸', country: 'USA', founded: 2015 },
    { name: 'Lordstown', flag: '🇺🇸', country: 'USA', founded: 2018 },
    { name: 'Lucid', flag: '🇺🇸', country: 'USA', founded: 2007 },
    { name: 'Panoz', flag: '🇺🇸', country: 'USA', founded: 1989 },
    { name: 'SSC', flag: '🇺🇸', country: 'USA', founded: 1999 }
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
    { name: 'Smart', flag: '🇩🇪', country: 'Germany', founded: 1994 },
    
    // Italy
    { name: 'Alfa Romeo', flag: '🇮🇹', country: 'Italy', founded: 1910 },
    { name: 'Ferrari', flag: '🇮🇹', country: 'Italy', founded: 1947 },
    { name: 'Fiat', flag: '🇮🇹', country: 'Italy', founded: 1899 },
    { name: 'Lamborghini', flag: '🇮🇹', country: 'Italy', founded: 1963 },
    { name: 'Maserati', flag: '🇮🇹', country: 'Italy', founded: 1914 },
    { name: 'Lancia', flag: '🇮🇹', country: 'Italy', founded: 1906 },
    { name: 'Pagani', flag: '🇮🇹', country: 'Italy', founded: 1992 },
    
    // France
    { name: 'Citroën', flag: '🇫🇷', country: 'France', founded: 1919 },
    { name: 'Peugeot', flag: '🇫🇷', country: 'France', founded: 1810 },
    { name: 'Renault', flag: '🇫🇷', country: 'France', founded: 1899 },
    { name: 'Alpine', flag: '🇫🇷', country: 'France', founded: 1955 },
    { name: 'DS', flag: '🇫🇷', country: 'France', founded: 2014 },
    
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
    { name: 'Volvo', flag: '🇸🇪', country: 'Sweden', founded: 1927 },
    { name: 'Koenigsegg', flag: '🇸🇪', country: 'Sweden', founded: 1994 },
    
    // Spain
    { name: 'SEAT', flag: '🇪🇸', country: 'Spain', founded: 1950 },
    { name: 'Cupra', flag: '🇪🇸', country: 'Spain', founded: 2018 },
    
    // Czech Republic
    { name: 'Skoda', flag: '🇨🇿', country: 'Czech Republic', founded: 1895 },
    
    // Netherlands
    { name: 'Spyker', flag: '🇳🇱', country: 'Netherlands', founded: 2000 },
    
    // Romania
    { name: 'Dacia', flag: '🇷🇴', country: 'Romania', founded: 1966 },
    
    // Croatia
    { name: 'Rimac', flag: '🇭🇷', country: 'Croatia', founded: 2009 }
  ].sort((a, b) => a.name.localeCompare(b.name)),

  electricAndOther: [
    { name: 'BYD', flag: '🇨🇳', country: 'China', founded: 1995 },
    { name: 'Lucid', flag: '🇺🇸', country: 'USA', founded: 2007 },
    { name: 'NIO', flag: '🇨🇳', country: 'China', founded: 2014 },
    { name: 'Polestar', flag: '🇸🇪', country: 'Sweden', founded: 1996 },
    { name: 'Rivian', flag: '🇺🇸', country: 'USA', founded: 2009 },
    { name: 'Tesla', flag: '🇺🇸', country: 'USA', founded: 2003 },
    { name: 'VinFast', flag: '🇻🇳', country: 'Vietnam', founded: 2017 },
    { name: 'Xpeng', flag: '🇨🇳', country: 'China', founded: 2014 },
    { name: 'Arrival', flag: '🇬🇧', country: 'UK', founded: 2015 },
    { name: 'Canoo', flag: '🇺🇸', country: 'USA', founded: 2017 },
    { name: 'Faraday Future', flag: '🇺🇸', country: 'USA', founded: 2014 },
    { name: 'Karma', flag: '🇺🇸', country: 'USA', founded: 2015 },
    { name: 'Lightyear', flag: '🇳🇱', country: 'Netherlands', founded: 2016 },
    { name: 'Lordstown', flag: '🇺🇸', country: 'USA', founded: 2018 },
    { name: 'Rimac', flag: '🇭🇷', country: 'Croatia', founded: 2009 },
    { name: 'Aiways', flag: '🇨🇳', country: 'China', founded: 2017 },
    { name: 'Ora', flag: '🇨🇳', country: 'China', founded: 2018 },
    { name: 'Weltmeister', flag: '🇨🇳', country: 'China', founded: 2015 }
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
