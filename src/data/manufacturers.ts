
import { Manufacturer, AffiliateProduct, ProductTier } from "@/types/affiliate";

export const manufacturers: Manufacturer[] = [
  // Automotive Manufacturers
  {
    id: "1",
    name: "Toyota",
    logoUrl: "https://www.carlogos.org/car-logos/toyota-logo-2019-1350x1500.png",
    description: "Japanese automotive manufacturer",
    slug: "toyota",
    featured: true,
    category: "automotive"
  },
  {
    id: "2",
    name: "Honda",
    logoUrl: "https://www.carlogos.org/car-logos/honda-logo-2000-2300x1300.png",
    description: "Japanese automotive and motorcycle manufacturer",
    slug: "honda",
    featured: true,
    category: "automotive"
  },
  {
    id: "3", 
    name: "Ford",
    logoUrl: "https://www.carlogos.org/logo/Ford-logo-2003-1366x768.png",
    description: "American multinational automaker",
    slug: "ford",
    featured: true,
    category: "automotive"
  },
  {
    id: "4",
    name: "Chevrolet",
    logoUrl: "https://www.carlogos.org/car-logos/chevrolet-logo-2013-2560x1440.png",
    description: "American automobile division of GM",
    slug: "chevrolet",
    featured: true,
    category: "automotive"
  },
  {
    id: "5",
    name: "BMW",
    logoUrl: "https://www.carlogos.org/car-logos/bmw-logo-2020-blue-white-1500x1500.png",
    description: "German luxury vehicle manufacturer",
    slug: "bmw",
    featured: true,
    category: "automotive"
  },
  {
    id: "6",
    name: "Mercedes-Benz",
    logoUrl: "https://www.carlogos.org/logo/Mercedes-Benz-logo-2011-1920x1080.png",
    description: "German luxury automobile manufacturer",
    slug: "mercedes",
    featured: false,
    category: "automotive"
  },
  {
    id: "7",
    name: "Audi",
    logoUrl: "https://www.carlogos.org/car-logos/audi-logo-2016-1500x1500.png", 
    description: "German luxury vehicle manufacturer",
    slug: "audi",
    featured: false,
    category: "automotive"
  },
  {
    id: "8",
    name: "Hyundai",
    logoUrl: "https://www.carlogos.org/car-logos/hyundai-logo-2017-1400x1500.png",
    description: "South Korean multinational automaker",
    slug: "hyundai",
    featured: false,
    category: "automotive"
  },
  {
    id: "9",
    name: "Kia",
    logoUrl: "https://www.carlogos.org/car-logos/kia-logo-2560x1440.png",
    description: "South Korean multinational automaker",
    slug: "kia",
    featured: false,
    category: "automotive"
  },
  {
    id: "10",
    name: "Nissan",
    logoUrl: "https://www.carlogos.org/car-logos/nissan-logo-2020-black-1500x1500.png",
    description: "Japanese multinational automobile manufacturer",
    slug: "nissan",
    featured: false,
    category: "automotive"
  },
  {
    id: "11",
    name: "Subaru",
    logoUrl: "https://www.carlogos.org/car-logos/subaru-logo-2019-1500x1500.png",
    description: "Japanese automobile manufacturer",
    slug: "subaru",
    featured: false,
    category: "automotive"
  },
  {
    id: "12",
    name: "Mazda",
    logoUrl: "https://www.carlogos.org/car-logos/mazda-logo-2018-1500x1500.png",
    description: "Japanese automaker based in Hiroshima",
    slug: "mazda",
    featured: false,
    category: "automotive"
  },
  {
    id: "13",
    name: "Volkswagen",
    logoUrl: "https://www.carlogos.org/car-logos/volkswagen-logo-2019-1500x1500.png",
    description: "German motor vehicle manufacturer",
    slug: "volkswagen",
    featured: false,
    category: "automotive"
  },
  {
    id: "14",
    name: "Volvo",
    logoUrl: "https://www.carlogos.org/car-logos/volvo-logo-2014-1500x1500.png",
    description: "Swedish luxury vehicle manufacturer",
    slug: "volvo",
    featured: false,
    category: "automotive"
  },
  {
    id: "15",
    name: "Jeep",
    logoUrl: "https://www.carlogos.org/car-logos/jeep-logo-2000-1920x1080.png",
    description: "American SUV and off-road vehicle brand",
    slug: "jeep",
    featured: false,
    category: "automotive"
  },
  
  // Heavy-Duty Truck Manufacturers
  {
    id: "16",
    name: "Peterbilt",
    logoUrl: "https://www.carlogos.org/logo/Peterbilt-logo-5500x1100.png",
    description: "American manufacturer of medium and heavy-duty trucks",
    slug: "peterbilt",
    featured: true,
    category: "heavy-duty"
  },
  {
    id: "17",
    name: "Kenworth",
    logoUrl: "https://www.carlogos.org/car-logos/kenworth-logo-1200x1200.png",
    description: "American manufacturer of commercial vehicles",
    slug: "kenworth",
    featured: false,
    category: "heavy-duty"
  },
  {
    id: "18",
    name: "Mack Trucks",
    logoUrl: "https://www.carlogos.org/car-logos/mack-logo-2200x500.png",
    description: "American truck manufacturing company",
    slug: "mack",
    featured: false,
    category: "heavy-duty"
  },
  {
    id: "19",
    name: "Freightliner",
    logoUrl: "https://www.carlogos.org/car-logos/freightliner-logo-1200x400.png",
    description: "American truck manufacturer",
    slug: "freightliner",
    featured: false,
    category: "heavy-duty"
  },
  {
    id: "20",
    name: "International",
    logoUrl: "https://www.carlogos.org/car-logos/international-trucks-logo-1200x900.png",
    description: "American manufacturer of heavy-duty trucks",
    slug: "international",
    featured: false,
    category: "heavy-duty"
  },
  {
    id: "21",
    name: "Volvo Trucks",
    logoUrl: "https://www.carlogos.org/car-logos/volvo-truck-logo-3300x1400.png",
    description: "Swedish manufacturer of commercial vehicles",
    slug: "volvo-trucks",
    featured: false,
    category: "heavy-duty"
  },
  {
    id: "22",
    name: "Western Star",
    logoUrl: "https://www.carlogos.org/car-logos/western-star-logo-800x600.png",
    description: "American manufacturer of heavy-duty trucks",
    slug: "western-star",
    featured: false,
    category: "heavy-duty"
  },
  
  // Equipment Manufacturers
  {
    id: "23",
    name: "Caterpillar",
    logoUrl: "https://www.carlogos.org/logo/Caterpillar-logo-2200x500.png",
    description: "American manufacturer of construction equipment",
    slug: "caterpillar",
    featured: true,
    category: "equipment"
  },
  {
    id: "24",
    name: "John Deere",
    logoUrl: "https://www.carlogos.org/car-logos/john-deere-logo-1200x1200.png",
    description: "American manufacturer of agricultural machinery",
    slug: "john-deere",
    featured: true,
    category: "equipment"
  },
  {
    id: "25",
    name: "Bobcat",
    logoUrl: "https://www.carlogos.org/car-logos/bobcat-logo-1500x1500.png",
    description: "American manufacturer of farm and construction equipment",
    slug: "bobcat",
    featured: false,
    category: "equipment"
  },
  {
    id: "26",
    name: "Kubota",
    logoUrl: "https://www.carlogos.org/car-logos/kubota-logo-1500x1500.png",
    description: "Japanese manufacturer of tractors and heavy equipment",
    slug: "kubota",
    featured: false,
    category: "equipment"
  },
  {
    id: "27",
    name: "Case",
    logoUrl: "https://www.carlogos.org/car-logos/case-logo-1500x1500.png",
    description: "American manufacturer of construction and agricultural equipment",
    slug: "case",
    featured: false,
    category: "equipment"
  },
  
  // Marine Manufacturers
  {
    id: "28",
    name: "Mercury Marine",
    logoUrl: "https://www.logocentral.info/wp-content/uploads/2019/06/Mercury-Marine-Logo.png",
    description: "American manufacturer of marine engines",
    slug: "mercury-marine",
    featured: true,
    category: "marine"
  },
  {
    id: "29",
    name: "Yamaha Marine",
    logoUrl: "https://www.logocentral.info/wp-content/uploads/2019/06/Yamaha-Marine-Logo.png",
    description: "Japanese manufacturer of marine products",
    slug: "yamaha-marine",
    featured: true,
    category: "marine"
  },
  {
    id: "30",
    name: "Evinrude",
    logoUrl: "https://seeklogo.com/images/E/evinrude-logo-7B5CAA797D-seeklogo.com.png",
    description: "American manufacturer of outboard motors",
    slug: "evinrude",
    featured: false,
    category: "marine"
  },
  {
    id: "31",
    name: "Suzuki Marine",
    logoUrl: "https://www.logocentral.info/wp-content/uploads/2019/06/Suzuki-Marine-Logo.png",
    description: "Japanese manufacturer of outboard motors",
    slug: "suzuki-marine",
    featured: false,
    category: "marine"
  },
  
  // ATV/UTV Manufacturers
  {
    id: "32",
    name: "Polaris",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Polaris_logo.svg/2560px-Polaris_logo.svg.png",
    description: "American manufacturer of ATVs, UTVs, and snowmobiles",
    slug: "polaris",
    featured: true,
    category: "atv-utv"
  },
  {
    id: "33",
    name: "Can-Am",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Can-Am_logo.svg/1280px-Can-Am_logo.svg.png",
    description: "Canadian manufacturer of ATVs and UTVs",
    slug: "can-am",
    featured: true,
    category: "atv-utv"
  },
  {
    id: "34",
    name: "Kawasaki",
    logoUrl: "https://www.carlogos.org/car-logos/kawasaki-motorcycle-logo-1200x1200.png",
    description: "Japanese manufacturer of motorcycles, ATVs, and UTVs",
    slug: "kawasaki",
    featured: false,
    category: "atv-utv"
  },
  {
    id: "35",
    name: "Arctic Cat",
    logoUrl: "https://www.carlogos.org/car-logos/arctic-cat-logo-1500x1500.png",
    description: "American manufacturer of snowmobiles and ATVs",
    slug: "arctic-cat",
    featured: false,
    category: "atv-utv"
  },
  
  // Motorcycle Manufacturers
  {
    id: "36",
    name: "Harley-Davidson",
    logoUrl: "https://www.carlogos.org/car-logos/harley-davidson-logo-2000x1000.png",
    description: "American motorcycle manufacturer",
    slug: "harley-davidson",
    featured: true,
    category: "motorcycle"
  },
  {
    id: "37",
    name: "Yamaha Motorcycles",
    logoUrl: "https://www.carlogos.org/car-logos/yamaha-motorcycle-logo-1600x1200.png",
    description: "Japanese manufacturer of motorcycles",
    slug: "yamaha-motorcycles",
    featured: true,
    category: "motorcycle"
  },
  {
    id: "38",
    name: "Ducati",
    logoUrl: "https://www.carlogos.org/car-logos/ducati-logo-1200x1200.png",
    description: "Italian manufacturer of motorcycles",
    slug: "ducati",
    featured: false,
    category: "motorcycle"
  },
  {
    id: "39",
    name: "Suzuki",
    logoUrl: "https://www.carlogos.org/car-logos/suzuki-logo-2000x1000.png",
    description: "Japanese multinational corporation",
    slug: "suzuki",
    featured: false,
    category: "motorcycle"
  },
  {
    id: "40",
    name: "Triumph",
    logoUrl: "https://www.carlogos.org/car-logos/triumph-motorcycle-logo-1500x1500.png",
    description: "British motorcycle manufacturer",
    slug: "triumph",
    featured: false,
    category: "motorcycle"
  }
];

// Sample manufacturer products data
export const generateManufacturerProducts = (manufacturerSlug: string): AffiliateProduct[] => {
  // Generate 12 products for the manufacturer
  return Array.from({ length: 12 }, (_, i) => {
    // Properly type the tier property to match ProductTier type
    const tier: ProductTier = i % 3 === 0 ? 'premium' : i % 3 === 1 ? 'midgrade' : 'economy';
    
    return {
      id: `${manufacturerSlug}-product-${i + 1}`,
      name: `${manufacturerSlug.charAt(0).toUpperCase() + manufacturerSlug.slice(1)} Tool ${i + 1}`,
      description: `High quality tool for ${manufacturerSlug.charAt(0).toUpperCase() + manufacturerSlug.slice(1)} vehicles`,
      imageUrl: `https://via.placeholder.com/300x200?text=${manufacturerSlug}-tool-${i + 1}`,
      tier,
      category: i % 5 === 0 ? 'Engine' : i % 5 === 1 ? 'Brakes' : i % 5 === 2 ? 'Electrical' : i % 5 === 3 ? 'Diagnostics' : 'Body',
      retailPrice: 50 + i * 10,
      affiliateUrl: "#",
      source: 'amazon',
      rating: Math.floor(Math.random() * 2) + 3 + Math.random(),
      reviewCount: Math.floor(Math.random() * 200) + 50,
      discount: i % 3 === 0 ? 10 : null,
      manufacturer: manufacturerSlug.charAt(0).toUpperCase() + manufacturerSlug.slice(1),
      model: `Model ${String.fromCharCode(65 + i % 10)}`,
      engineType: i % 3 === 0 ? '4-Cylinder' : i % 3 === 1 ? 'V6' : 'V8'
    };
  });
};
