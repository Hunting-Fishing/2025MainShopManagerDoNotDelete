
export const emojiToCountryCode: { [key: string]: string } = {
  '🇯🇵': 'JP', '🇰🇷': 'KR', '🇨🇳': 'CN', '🇺🇸': 'US',
  '🇩🇪': 'DE', '🇮🇹': 'IT', '🇫🇷': 'FR', '🇬🇧': 'GB',
  '🇸🇪': 'SE', '🇨🇦': 'CA', '🇹🇼': 'TW', '🇮🇳': 'IN',
  '🇻🇳': 'VN'
};

export const getCountryCode = (flag: string): string => {
  return emojiToCountryCode[flag] || '';
};

// Add mapping for manufacturer names to standardized formats
export const getStandardizedManufacturerName = (name: string): string => {
  const nameMap: { [key: string]: string } = {
    'vw': 'volkswagen',
    'chevy': 'chevrolet',
    'mercedes': 'mercedesbenz',
    'mercedes-benz': 'mercedesbenz',
    'landrover': 'land-rover',
    'land rover': 'land-rover',
    'alfa': 'alfaromeo',
    'alfa romeo': 'alfaromeo',
    'aston': 'astonmartin',
    'aston martin': 'astonmartin'
  };
  
  return nameMap[name.toLowerCase()] || name.toLowerCase();
};
