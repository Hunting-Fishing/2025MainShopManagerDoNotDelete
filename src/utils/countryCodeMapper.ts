export const emojiToCountryCode: { [key: string]: string } = {
  // European Countries
  '🇦🇩': 'AD', // Andorra
  '🇦🇹': 'AT', // Austria
  '🇦🇿': 'AZ', // Azerbaijan
  '🇧🇪': 'BE', // Belgium
  '🇭🇷': 'HR', // Croatia
  '🇨🇿': 'CZ', // Czech Republic
  '🇩🇰': 'DK', // Denmark
  '🇪🇪': 'EE', // Estonia
  '🇫🇮': 'FI', // Finland
  '🇫🇷': 'FR', // France
  '🇩🇪': 'DE', // Germany
  '🇭🇺': 'HU', // Hungary
  '🇱🇮': 'LI', // Liechtenstein
  '🇱🇻': 'LV', // Latvia
  '🇱🇹': 'LT', // Lithuania
  '🇲🇨': 'MC', // Monaco
  '🇳🇱': 'NL', // Netherlands
  '🇳🇴': 'NO', // Norway
  '🇵🇱': 'PL', // Poland
  '🇵🇹': 'PT', // Portugal
  '🇷🇴': 'RO', // Romania
  '🇷🇺': 'RU', // Russia
  '🇷🇸': 'RS', // Serbia
  '🇸🇰': 'SK', // Slovakia
  '🇸🇮': 'SI', // Slovenia
  '🇪🇸': 'ES', // Spain
  '🇸🇪': 'SE', // Sweden
  '🇨🇭': 'CH', // Switzerland
  '🇺🇦': 'UA', // Ukraine
  '🇬🇧': 'GB', // United Kingdom

  // Asian Countries
  '🇨🇳': 'CN', // China
  '🇮🇳': 'IN', // India
  '🇮🇷': 'IR', // Iran
  '🇮🇱': 'IL', // Israel
  '🇯🇵': 'JP', // Japan
  '🇰🇷': 'KR', // South Korea
  '🇲🇾': 'MY', // Malaysia
  '🇵🇰': 'PK', // Pakistan
  '🇸🇬': 'SG', // Singapore
  '🇱🇰': 'LK', // Sri Lanka
  '🇹🇼': 'TW', // Taiwan
  '🇹🇭': 'TH', // Thailand
  '🇺🇿': 'UZ', // Uzbekistan
  '🇻🇳': 'VN', // Vietnam
  '🇦🇪': 'AE', // United Arab Emirates

  // Americas
  '🇦🇷': 'AR', // Argentina
  '🇧🇷': 'BR', // Brazil
  '🇨🇦': 'CA', // Canada
  '🇲🇽': 'MX', // Mexico
  '🇺🇸': 'US', // USA

  // Africa
  '🇲🇦': 'MA', // Morocco
  '🇳🇬': 'NG', // Nigeria
  '🇿🇦': 'ZA', // South Africa
  '🇹🇳': 'TN', // Tunisia

  // Oceania
  '🇦🇺': 'AU', // Australia
  '🇳🇿': 'NZ'  // New Zealand
};

export const getCountryCode = (flag: string): string => {
  return emojiToCountryCode[flag] || '';
};

export const getStandardizedManufacturerName = (name: string): string => {
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
    'saab': 'saab',
    'seat': 'seat',
    'skoda': 'skoda',
    'smart': 'smart',
    'alpina': 'alpina',
    'artega': 'artega',
    'donkervoort': 'donkervoort',
    'gumpert': 'gumpert',
    'wiesmann': 'wiesmann',
    'pagani': 'pagani',
    'koenigsegg': 'koenigsegg',
    'spyker': 'spyker',
    'morgan': 'morgan',
    'caterham': 'caterham',
    'noble': 'noble',
    'tvr': 'tvr',
    'venturi': 'venturi',
    'alpine': 'alpine',
    'ds': 'ds',
    'lancia': 'lancia',
    'maybach': 'maybach',
    
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
    'perodua': 'perodua',
    'proton': 'proton',
    'tata': 'tata',
    'mahindra': 'mahindra',
    'maruti': 'maruti',
    'holden': 'holden',
    'great wall': 'greatwall',
    'haval': 'haval',
    'hongqi': 'hongqi',
    'saic': 'saic',
    'wey': 'wey',
    'changan': 'changan',
    'geely': 'geely',
    'foton': 'foton',
    'brilliance': 'brilliance',
    'lifan': 'lifan',
    
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
    'pontiac': 'pontiac',
    'saturn': 'saturn',
    'mercury': 'mercury',
    'oldsmobile': 'oldsmobile',
    'hummer': 'hummer',
    'plymouth': 'plymouth',
    'packard': 'packard',
    'delorean': 'delorean',
    'studebaker': 'studebaker',
    
    // Electric & New
    'tesla': 'tesla',
    'rivian': 'rivian',
    'lucid': 'lucid',
    'nio': 'nio',
    'xpeng': 'xpeng',
    'byd': 'byd',
    'polestar': 'polestar',
    'vinfast': 'vinfast',
    'li auto': 'liauto',
    'fisker': 'fisker',
    'faraday': 'faraday',
    'karma': 'karma',
    'canoo': 'canoo',
    'arrival': 'arrival',
    'lordstown': 'lordstown',
    'rimac': 'rimac'
  };
  
  return nameMap[normalizedInput] || normalizedInput;
};
