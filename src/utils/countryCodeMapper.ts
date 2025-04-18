
export const emojiToCountryCode: { [key: string]: string } = {
  '🇯🇵': 'JP', '🇰🇷': 'KR', '🇨🇳': 'CN', '🇺🇸': 'US',
  '🇩🇪': 'DE', '🇮🇹': 'IT', '🇫🇷': 'FR', '🇬🇧': 'GB',
  '🇸🇪': 'SE', '🇨🇦': 'CA', '🇹🇼': 'TW', '🇮🇳': 'IN',
  '🇻🇳': 'VN'
};

export const getCountryCode = (flag: string): string => {
  return emojiToCountryCode[flag] || '';
};
