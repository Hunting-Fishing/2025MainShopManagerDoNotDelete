
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
  // First normalize the input
  const normalizedInput = name.trim().toLowerCase();
  
  const nameMap: { [key: string]: string } = {
    // European
    'vw': 'volkswagen',
    'volkswagen': 'volkswagen',
    'chevy': 'chevrolet',
    'chevrolet': 'chevrolet',
    'mercedes': 'mercedes',
    'mercedes-benz': 'mercedes',
    'bmw': 'bmw',
    'audi': 'audi',
    'landrover': 'landrover',
    'land rover': 'landrover',
    'alfa': 'alfaromeo',
    'alfa romeo': 'alfaromeo',
    'aston': 'astonmartin',
    'aston martin': 'astonmartin',
    'bentley': 'bentley',
    'bugatti': 'bugatti',
    'citroen': 'citroen',
    'ferrari': 'ferrari',
    'fiat': 'fiat',
    'jaguar': 'jaguar',
    'lamborghini': 'lamborghini',
    'maserati': 'maserati', 
    'mini': 'mini',
    'porsche': 'porsche',
    'volvo': 'volvo',
    'opel': 'opel',
    'peugeot': 'peugeot',
    'renault': 'renault',
    'rolls-royce': 'rollsroyce',
    'rolls royce': 'rollsroyce',
    
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
    'ssangyong': 'ssangyong',
    'daihatsu': 'daihatsu',
    'isuzu': 'isuzu',
    'daewoo': 'daewoo',
    'dacia': 'dacia',
    
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
    'eagle': 'eagle',
    
    // Electric & New
    'tesla': 'tesla',
    'rivian': 'rivian',
    'lucid': 'lucid',
    'nio': 'nio',
    'xpeng': 'xpeng',
    'byd': 'byd',
    'polestar': 'polestar',
    'vinfast': 'vinfast',
    'great wall': 'greatwall',
    'great-wall': 'greatwall',
    'mg': 'mg',
    'geely': 'geely',
    'genesis': 'genesis',
    'chery': 'chery',
    'dfsk': 'dfsk',
    'saic': 'saic',
    'fisker': 'fisker'
  };
  
  // From the screenshot we can see the name is just lowercase with no hyphens
  return nameMap[normalizedInput] || normalizedInput;
};
