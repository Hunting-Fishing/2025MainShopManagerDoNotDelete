
export const emojiToCountryCode: { [key: string]: string } = {
  '🇯🇵': 'JP', '🇰🇷': 'KR', '🇨🇳': 'CN', '🇺🇸': 'US',
  '🇩🇪': 'DE', '🇮🇹': 'IT', '🇫🇷': 'FR', '🇬🇧': 'GB',
  '🇸🇪': 'SE', '🇨🇦': 'CA', '🇹🇼': 'TW', '🇮🇳': 'IN',
  '🇻🇳': 'VN'
};

export const getCountryCode = (flag: string): string => {
  return emojiToCountryCode[flag] || '';
};

// Comprehensive mapping for manufacturer names to standardized formats for icon display
export const getStandardizedManufacturerName = (name: string): string => {
  const nameMap: { [key: string]: string } = {
    // European
    'vw': 'volkswagen',
    'volkswagen': 'volkswagen',
    'chevy': 'chevrolet',
    'chevrolet': 'chevrolet',
    'mercedes': 'mercedesbenz',
    'mercedes-benz': 'mercedesbenz',
    'bmw': 'bmw',
    'audi': 'audi',
    'landrover': 'land-rover',
    'land rover': 'land-rover',
    'alfa': 'alfaromeo',
    'alfa romeo': 'alfaromeo',
    'aston': 'astonmartin',
    'aston martin': 'astonmartin',
    'mini': 'mini',
    'fiat': 'fiat',
    'porsche': 'porsche',
    'volvo': 'volvo',
    'jaguar': 'jaguar',
    'opel': 'opel',
    'peugeot': 'peugeot',
    'renault': 'renault',
    
    // Asian
    'honda': 'honda',
    'toyota': 'toyota',
    'nissan': 'nissan',
    'lexus': 'lexus',
    'mazda': 'mazda',
    'subaru': 'subaru',
    'mitsubishi': 'mitsubishi',
    'hyundai': 'hyundai',
    'kia': 'kia',
    'suzuki': 'suzuki',
    'infiniti': 'infiniti',
    'acura': 'acura',
    
    // American
    'ford': 'ford',
    'gmc': 'gmc',
    'dodge': 'dodge',
    'jeep': 'jeep',
    'lincoln': 'lincoln',
    'cadillac': 'cadillac',
    'chrysler': 'chrysler',
    'buick': 'buick',
    'ram': 'ram',
    'tesla': 'tesla'
  };
  
  return nameMap[name.toLowerCase().trim()] || name.toLowerCase().trim();
};
