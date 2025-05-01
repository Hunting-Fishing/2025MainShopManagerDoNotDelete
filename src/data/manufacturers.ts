
import { Manufacturer } from '@/types/affiliate';
import { AffiliateProduct } from '@/types/affiliate';

/**
 * Manufacturers data with expanded categories
 * Categories: automotive, heavy-duty, equipment, marine, atv-utv, motorcycle
 */
export const manufacturers: Manufacturer[] = [
  // Automotive Manufacturers
  {
    id: "1",
    name: "Toyota",
    logoUrl: "https://via.placeholder.com/200x100?text=Toyota",
    description: "Japanese automotive manufacturer known for reliable vehicles.",
    slug: "toyota",
    featured: true,
    category: "automotive"
  },
  {
    id: "2",
    name: "Ford",
    logoUrl: "https://via.placeholder.com/200x100?text=Ford",
    description: "American automotive company with a global presence.",
    slug: "ford",
    featured: true,
    category: "automotive"
  },
  {
    id: "3",
    name: "Chevrolet",
    logoUrl: "https://via.placeholder.com/200x100?text=Chevrolet",
    description: "American automobile division of GM.",
    slug: "chevrolet",
    featured: false,
    category: "automotive"
  },
  {
    id: "4",
    name: "Honda",
    logoUrl: "https://via.placeholder.com/200x100?text=Honda",
    description: "Japanese manufacturer of automobiles and motorcycles.",
    slug: "honda",
    featured: true,
    category: "automotive"
  },
  {
    id: "5",
    name: "BMW",
    logoUrl: "https://via.placeholder.com/200x100?text=BMW",
    description: "German luxury vehicle manufacturer.",
    slug: "bmw",
    featured: true,
    category: "automotive"
  },
  {
    id: "6",
    name: "Mercedes-Benz",
    logoUrl: "https://via.placeholder.com/200x100?text=Mercedes",
    description: "German automobile manufacturer specializing in luxury vehicles.",
    slug: "mercedes-benz",
    featured: true,
    category: "automotive"
  },
  {
    id: "7",
    name: "Volkswagen",
    logoUrl: "https://via.placeholder.com/200x100?text=Volkswagen",
    description: "German automobile manufacturer.",
    slug: "volkswagen",
    featured: false,
    category: "automotive"
  },
  {
    id: "8",
    name: "Audi",
    logoUrl: "https://via.placeholder.com/200x100?text=Audi",
    description: "German automobile manufacturer specializing in luxury vehicles.",
    slug: "audi",
    featured: false,
    category: "automotive"
  },
  {
    id: "9",
    name: "Nissan",
    logoUrl: "https://via.placeholder.com/200x100?text=Nissan",
    description: "Japanese multinational automobile manufacturer.",
    slug: "nissan",
    featured: false,
    category: "automotive"
  },
  {
    id: "10",
    name: "Hyundai",
    logoUrl: "https://via.placeholder.com/200x100?text=Hyundai",
    description: "South Korean multinational automotive manufacturer.",
    slug: "hyundai",
    featured: false,
    category: "automotive"
  },
  {
    id: "11",
    name: "Kia",
    logoUrl: "https://via.placeholder.com/200x100?text=Kia",
    description: "South Korean multinational automobile manufacturer.",
    slug: "kia",
    featured: false,
    category: "automotive"
  },
  {
    id: "12",
    name: "Subaru",
    logoUrl: "https://via.placeholder.com/200x100?text=Subaru",
    description: "Japanese automobile manufacturer.",
    slug: "subaru",
    featured: false,
    category: "automotive"
  },
  {
    id: "13",
    name: "Mazda",
    logoUrl: "https://via.placeholder.com/200x100?text=Mazda",
    description: "Japanese multinational automaker.",
    slug: "mazda",
    featured: false,
    category: "automotive"
  },
  {
    id: "14", 
    name: "Lexus",
    logoUrl: "https://via.placeholder.com/200x100?text=Lexus",
    description: "Luxury vehicle division of Toyota.",
    slug: "lexus",
    featured: true,
    category: "automotive"
  },
  {
    id: "15",
    name: "Jeep",
    logoUrl: "https://via.placeholder.com/200x100?text=Jeep",
    description: "American brand of off-road vehicles.",
    slug: "jeep",
    featured: false,
    category: "automotive"
  },
  {
    id: "16",
    name: "Volvo",
    logoUrl: "https://via.placeholder.com/200x100?text=Volvo",
    description: "Swedish luxury vehicles manufacturer.",
    slug: "volvo",
    featured: false,
    category: "automotive"
  },
  
  // Heavy-Duty Manufacturers
  {
    id: "17", 
    name: "Peterbilt",
    logoUrl: "https://via.placeholder.com/200x100?text=Peterbilt",
    description: "American manufacturer of heavy-duty trucks.",
    slug: "peterbilt",
    featured: true,
    category: "heavy-duty"
  },
  {
    id: "18",
    name: "Kenworth",
    logoUrl: "https://via.placeholder.com/200x100?text=Kenworth",
    description: "American manufacturer of medium and heavy-duty trucks.",
    slug: "kenworth",
    featured: true,
    category: "heavy-duty"
  },
  {
    id: "19",
    name: "Freightliner",
    logoUrl: "https://via.placeholder.com/200x100?text=Freightliner",
    description: "American truck manufacturer and subsidiary of Daimler AG.",
    slug: "freightliner",
    featured: false,
    category: "heavy-duty"
  },
  {
    id: "20",
    name: "Volvo Trucks",
    logoUrl: "https://via.placeholder.com/200x100?text=Volvo+Trucks",
    description: "Swedish commercial vehicle manufacturer and subsidiary of Volvo Group.",
    slug: "volvo-trucks",
    featured: false,
    category: "heavy-duty"
  },
  {
    id: "21",
    name: "Mack Trucks",
    logoUrl: "https://via.placeholder.com/200x100?text=Mack+Trucks",
    description: "American truck manufacturing company and subsidiary of Volvo Group.",
    slug: "mack-trucks",
    featured: false,
    category: "heavy-duty"
  },
  {
    id: "22",
    name: "International",
    logoUrl: "https://via.placeholder.com/200x100?text=International",
    description: "American commercial truck brand manufactured by Navistar International.",
    slug: "international",
    featured: false,
    category: "heavy-duty"
  },
  
  // Equipment Manufacturers
  {
    id: "23",
    name: "Caterpillar",
    logoUrl: "https://via.placeholder.com/200x100?text=Caterpillar",
    description: "American manufacturer of construction and mining equipment.",
    slug: "caterpillar",
    featured: true,
    category: "equipment"
  },
  {
    id: "24",
    name: "John Deere",
    logoUrl: "https://via.placeholder.com/200x100?text=John+Deere",
    description: "American manufacturer of agricultural, construction, and forestry machinery.",
    slug: "john-deere",
    featured: true,
    category: "equipment"
  },
  {
    id: "25",
    name: "Kubota",
    logoUrl: "https://via.placeholder.com/200x100?text=Kubota",
    description: "Japanese manufacturer of tractors and heavy equipment.",
    slug: "kubota",
    featured: false,
    category: "equipment"
  },
  {
    id: "26",
    name: "Bobcat",
    logoUrl: "https://via.placeholder.com/200x100?text=Bobcat",
    description: "American manufacturer of construction equipment.",
    slug: "bobcat",
    featured: false,
    category: "equipment"
  },
  {
    id: "27",
    name: "Case",
    logoUrl: "https://via.placeholder.com/200x100?text=Case",
    description: "American manufacturer of construction equipment and agricultural equipment.",
    slug: "case",
    featured: false,
    category: "equipment"
  },
  
  // Marine Manufacturers
  {
    id: "28",
    name: "Mercury Marine",
    logoUrl: "https://via.placeholder.com/200x100?text=Mercury+Marine",
    description: "American manufacturer of marine engines.",
    slug: "mercury-marine",
    featured: true,
    category: "marine"
  },
  {
    id: "29",
    name: "Yamaha Marine",
    logoUrl: "https://via.placeholder.com/200x100?text=Yamaha+Marine",
    description: "Japanese manufacturer of marine engines and watercraft.",
    slug: "yamaha-marine",
    featured: true,
    category: "marine"
  },
  {
    id: "30",
    name: "Evinrude",
    logoUrl: "https://via.placeholder.com/200x100?text=Evinrude",
    description: "American manufacturer of outboard motors for boats.",
    slug: "evinrude",
    featured: false,
    category: "marine"
  },
  {
    id: "31",
    name: "Volvo Penta",
    logoUrl: "https://via.placeholder.com/200x100?text=Volvo+Penta",
    description: "Swedish manufacturer of marine engines.",
    slug: "volvo-penta",
    featured: false,
    category: "marine"
  },
  
  // ATV/UTV Manufacturers
  {
    id: "32",
    name: "Polaris",
    logoUrl: "https://via.placeholder.com/200x100?text=Polaris",
    description: "American manufacturer of ATVs, UTVs, and snowmobiles.",
    slug: "polaris",
    featured: true,
    category: "atv-utv"
  },
  {
    id: "33",
    name: "Can-Am",
    logoUrl: "https://via.placeholder.com/200x100?text=Can-Am",
    description: "Canadian manufacturer of ATVs and UTVs.",
    slug: "can-am",
    featured: true,
    category: "atv-utv"
  },
  {
    id: "34",
    name: "Arctic Cat",
    logoUrl: "https://via.placeholder.com/200x100?text=Arctic+Cat",
    description: "American manufacturer of ATVs and snowmobiles.",
    slug: "arctic-cat",
    featured: false,
    category: "atv-utv"
  },
  {
    id: "35",
    name: "Kawasaki",
    logoUrl: "https://via.placeholder.com/200x100?text=Kawasaki",
    description: "Japanese manufacturer of motorcycles and ATVs.",
    slug: "kawasaki",
    featured: false,
    category: "atv-utv"
  },
  
  // Motorcycle Manufacturers
  {
    id: "36",
    name: "Harley-Davidson",
    logoUrl: "https://via.placeholder.com/200x100?text=Harley-Davidson",
    description: "American manufacturer of motorcycles.",
    slug: "harley-davidson",
    featured: true,
    category: "motorcycle"
  },
  {
    id: "37",
    name: "Yamaha Motorcycles",
    logoUrl: "https://via.placeholder.com/200x100?text=Yamaha+Motorcycles",
    description: "Japanese manufacturer of motorcycles.",
    slug: "yamaha-motorcycles",
    featured: true,
    category: "motorcycle"
  },
  {
    id: "38",
    name: "Ducati",
    logoUrl: "https://via.placeholder.com/200x100?text=Ducati",
    description: "Italian manufacturer of motorcycles.",
    slug: "ducati",
    featured: true,
    category: "motorcycle"
  },
  {
    id: "39",
    name: "KTM",
    logoUrl: "https://via.placeholder.com/200x100?text=KTM",
    description: "Austrian manufacturer of motorcycles and sports cars.",
    slug: "ktm",
    featured: false,
    category: "motorcycle"
  },
  {
    id: "40",
    name: "Honda Motorcycles",
    logoUrl: "https://via.placeholder.com/200x100?text=Honda+Motorcycles",
    description: "Japanese manufacturer of motorcycles.",
    slug: "honda-motorcycles",
    featured: false,
    category: "motorcycle"
  },
  {
    id: "41",
    name: "Suzuki",
    logoUrl: "https://via.placeholder.com/200x100?text=Suzuki",
    description: "Japanese manufacturer of motorcycles, cars, and marine engines.",
    slug: "suzuki",
    featured: false,
    category: "motorcycle"
  },
];

/**
 * Generate mock products for a specific manufacturer
 * @param manufacturerId The ID of the manufacturer
 * @param count Number of products to generate
 * @returns Array of mock affiliate products
 */
export const generateManufacturerProducts = (manufacturerId: string, count: number = 8): AffiliateProduct[] => {
  // Find the manufacturer to use its name and category
  const manufacturer = manufacturers.find(m => m.id === manufacturerId);
  
  if (!manufacturer) {
    return [];
  }

  const tiers: ('premium' | 'midgrade' | 'economy')[] = ['premium', 'midgrade', 'economy'];
  const products: AffiliateProduct[] = [];

  // Product type based on category
  const getCategoryBasedProducts = (category: string): string[] => {
    switch(category) {
      case 'automotive':
        return ['Oil Filter', 'Air Filter', 'Brake Pad Kit', 'Spark Plugs', 'Wiper Blades', 'Engine Oil', 'Battery', 'Alternator'];
      case 'heavy-duty':
        return ['Brake System', 'Air Filters', 'Fuel Filters', 'Engine Components', 'Transmission Parts', 'Exhaust Systems', 'Drive Axles', 'Electrical Components'];
      case 'equipment':
        return ['Hydraulic Filters', 'Cutting Blades', 'Track Parts', 'Engine Kits', 'Control Valves', 'Hydraulic Pumps', 'Seals and Gaskets', 'Electrical Components'];
      case 'marine':
        return ['Propellers', 'Impellers', 'Anodes', 'Fuel Filters', 'Oil Filters', 'Spark Plugs', 'Electrical Parts', 'Control Cables'];
      case 'atv-utv':
        return ['Tires', 'Winches', 'Suspension Components', 'Brake Pads', 'Air Filters', 'Clutch Kits', 'Electrical Parts', 'Drive Belts'];
      case 'motorcycle':
        return ['Tires', 'Chains', 'Brake Pads', 'Oil Filters', 'Air Filters', 'Spark Plugs', 'Exhaust Systems', 'Batteries'];
      default:
        return ['Tool Set', 'Diagnostic Scanner', 'Repair Kit', 'Service Parts', 'Maintenance Kit', 'Performance Parts', 'Replacement Parts', 'Accessories'];
    }
  };

  const productTypes = getCategoryBasedProducts(manufacturer.category);

  for (let i = 0; i < count; i++) {
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const productType = productTypes[i % productTypes.length];
    const basePrice = tier === 'premium' ? 100 + Math.random() * 400 : 
                      tier === 'midgrade' ? 50 + Math.random() * 150 : 
                      20 + Math.random() * 80;
    
    const hasDiscount = Math.random() > 0.7;
    const discount = hasDiscount ? Math.floor(Math.random() * 25) : undefined;
    
    products.push({
      id: `${manufacturerId}-${i + 1}`,
      name: `${manufacturer.name} ${productType} - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Series`,
      description: `High-quality ${productType.toLowerCase()} from ${manufacturer.name} designed for optimal performance and reliability.`,
      imageUrl: `https://via.placeholder.com/400x300?text=${manufacturer.name}+${productType}`,
      tier: tier,
      category: manufacturer.category,
      retailPrice: Math.round(basePrice * 100) / 100,
      affiliateUrl: '#',
      source: Math.random() > 0.3 ? 'amazon' : 'other',
      isFeatured: Math.random() > 0.8,
      rating: 3 + Math.random() * 2,
      reviewCount: Math.floor(Math.random() * 200),
      discount: discount,
      manufacturer: manufacturer.name,
      model: `${manufacturer.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      bestSeller: Math.random() > 0.9,
      freeShipping: Math.random() > 0.5
    });
  }

  return products;
};
