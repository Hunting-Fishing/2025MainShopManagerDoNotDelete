
interface Brand {
  name: string;
  flag: string;
  country: string;
  category: 'recreational' | 'workUtility' | 'electric' | 'european';
}

export const atvUtvBrands: Brand[] = [
  // Mainstream Recreational / Utility
  { name: 'Polaris', flag: '🇺🇸', country: 'USA', category: 'recreational' },
  { name: 'Can-Am (BRP)', flag: '🇨🇦', country: 'Canada', category: 'recreational' },
  { name: 'Yamaha', flag: '🇯🇵', country: 'Japan', category: 'recreational' },
  { name: 'Honda', flag: '🇯🇵', country: 'Japan', category: 'recreational' },
  { name: 'Kawasaki', flag: '🇯🇵', country: 'Japan', category: 'recreational' },
  { name: 'Suzuki', flag: '🇯🇵', country: 'Japan', category: 'recreational' },
  { name: 'Arctic Cat / Textron Off Road', flag: '🇺🇸', country: 'USA', category: 'recreational' },
  { name: 'CFMOTO', flag: '🇨🇳', country: 'China', category: 'recreational' },
  { name: 'Kymco', flag: '🇹🇼', country: 'Taiwan', category: 'recreational' },
  { name: 'Hisun', flag: '🇨🇳', country: 'China', category: 'recreational' },
  { name: 'Segway Powersports', flag: '🇨🇳', country: 'China', category: 'recreational' },
  { name: 'Massimo', flag: '🇺🇸', country: 'USA', category: 'recreational' },
  { name: 'Tracker Off Road', flag: '🇺🇸', country: 'USA', category: 'recreational' },
  { name: 'Tao Motor', flag: '🇨🇳', country: 'China', category: 'recreational' },
  { name: 'SSR Motorsports', flag: '🇺🇸', country: 'USA', category: 'recreational' },
  { name: 'Linhai', flag: '🇨🇳', country: 'China', category: 'recreational' },
  { name: 'Pitster Pro', flag: '🇺🇸', country: 'USA', category: 'recreational' },

  // Work Utility / Agricultural / Industrial
  { name: 'John Deere Gator', flag: '🇺🇸', country: 'USA', category: 'workUtility' },
  { name: 'Kubota RTV', flag: '🇯🇵', country: 'Japan', category: 'workUtility' },
  { name: 'Bobcat Utility Vehicles', flag: '🇺🇸', country: 'USA', category: 'workUtility' },
  { name: 'Mahindra ROXOR', flag: '🇮🇳', country: 'India', category: 'workUtility' },
  { name: 'Kioti Mechron', flag: '🇰🇷', country: 'South Korea', category: 'workUtility' },
  { name: 'Gravely Atlas JSV', flag: '🇺🇸', country: 'USA', category: 'workUtility' },
  { name: 'JCB Workmax', flag: '🇬🇧', country: 'UK', category: 'workUtility' },
  { name: 'New Holland', flag: '🇮🇹', country: 'Italy', category: 'workUtility' },
  { name: 'Club Car Carryall', flag: '🇺🇸', country: 'USA', category: 'workUtility' },

  // Electric / EV & New Tech
  { name: 'Volcon', flag: '🇺🇸', country: 'USA', category: 'electric' },
  { name: 'Polaris Ranger EV', flag: '🇺🇸', country: 'USA', category: 'electric' },
  { name: 'Eco Charger', flag: '🇬🇧', country: 'UK', category: 'electric' },
  { name: 'DRR USA EV ATV', flag: '🇺🇸', country: 'USA', category: 'electric' },
  { name: 'Textron Prowler EV', flag: '🇺🇸', country: 'USA', category: 'electric' },

  // European / Global / Niche Brands
  { name: 'TGB (Taiwan Golden Bee)', flag: '🇹🇼', country: 'Taiwan', category: 'european' },
  { name: 'Access Motor', flag: '🇹🇼', country: 'Taiwan', category: 'european' },
  { name: 'GOES', flag: '🇫🇷', country: 'France', category: 'european' },
  { name: 'Quadzilla', flag: '🇬🇧', country: 'UK', category: 'european' },
  { name: 'Aeon', flag: '🇹🇼', country: 'Taiwan', category: 'european' },
  { name: 'Adly', flag: '🇹🇼', country: 'Taiwan', category: 'european' },
  { name: 'Barossa', flag: '🇬🇧', country: 'UK', category: 'european' },
  { name: 'Hammerhead Off-Road', flag: '🇺🇸', country: 'USA', category: 'european' },
  { name: 'BMS Motorsports', flag: '🇺🇸', country: 'USA', category: 'european' },
  { name: 'Xinyang', flag: '🇨🇳', country: 'China', category: 'european' },
  { name: 'Canwolf', flag: '🇨🇦', country: 'Canada', category: 'european' }
];

export const groupedAtvUtvBrands = {
  recreational: atvUtvBrands.filter(brand => brand.category === 'recreational'),
  workUtility: atvUtvBrands.filter(brand => brand.category === 'workUtility'),
  electric: atvUtvBrands.filter(brand => brand.category === 'electric'),
  european: atvUtvBrands.filter(brand => brand.category === 'european')
};

export const getAllAtvUtvBrands = () => atvUtvBrands.map(brand => brand.name);
