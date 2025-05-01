import { Manufacturer, AffiliateProduct, ProductTier } from "@/types/affiliate";

export const manufacturers: Manufacturer[] = [
  {
    id: "1",
    name: "Toyota",
    logoUrl: "https://www.carlogos.org/car-logos/toyota-logo-2019-1350x1500.png",
    description: "Japanese automotive manufacturer",
    slug: "toyota",
    featured: true
  },
  {
    id: "2",
    name: "Honda",
    logoUrl: "https://www.carlogos.org/car-logos/honda-logo-2000-2300x1300.png",
    description: "Japanese automotive and motorcycle manufacturer",
    slug: "honda",
    featured: true
  },
  {
    id: "3", 
    name: "Ford",
    logoUrl: "https://www.carlogos.org/logo/Ford-logo-2003-1366x768.png",
    description: "American multinational automaker",
    slug: "ford",
    featured: true
  },
  {
    id: "4",
    name: "Chevrolet",
    logoUrl: "https://www.carlogos.org/car-logos/chevrolet-logo-2013-2560x1440.png",
    description: "American automobile division of GM",
    slug: "chevrolet",
    featured: true
  },
  {
    id: "5",
    name: "BMW",
    logoUrl: "https://www.carlogos.org/car-logos/bmw-logo-2020-blue-white-1500x1500.png",
    description: "German luxury vehicle manufacturer",
    slug: "bmw",
    featured: true
  },
  {
    id: "6",
    name: "Mercedes-Benz",
    logoUrl: "https://www.carlogos.org/logo/Mercedes-Benz-logo-2011-1920x1080.png",
    description: "German luxury automobile manufacturer",
    slug: "mercedes",
    featured: false
  },
  {
    id: "7",
    name: "Audi",
    logoUrl: "https://www.carlogos.org/car-logos/audi-logo-2016-1500x1500.png", 
    description: "German luxury vehicle manufacturer",
    slug: "audi",
    featured: false
  },
  {
    id: "8",
    name: "Hyundai",
    logoUrl: "https://www.carlogos.org/car-logos/hyundai-logo-2017-1400x1500.png",
    description: "South Korean multinational automaker",
    slug: "hyundai",
    featured: false
  },
  {
    id: "9",
    name: "Kia",
    logoUrl: "https://www.carlogos.org/car-logos/kia-logo-2560x1440.png",
    description: "South Korean multinational automaker",
    slug: "kia",
    featured: false
  },
  {
    id: "10",
    name: "Nissan",
    logoUrl: "https://www.carlogos.org/car-logos/nissan-logo-2020-black-1500x1500.png",
    description: "Japanese multinational automobile manufacturer",
    slug: "nissan",
    featured: false
  },
  {
    id: "11",
    name: "Subaru",
    logoUrl: "https://www.carlogos.org/car-logos/subaru-logo-2019-1500x1500.png",
    description: "Japanese automobile manufacturer",
    slug: "subaru",
    featured: false
  },
  {
    id: "12",
    name: "Mazda",
    logoUrl: "https://www.carlogos.org/car-logos/mazda-logo-2018-1500x1500.png",
    description: "Japanese automaker based in Hiroshima",
    slug: "mazda",
    featured: false
  },
  {
    id: "13",
    name: "Volkswagen",
    logoUrl: "https://www.carlogos.org/car-logos/volkswagen-logo-2019-1500x1500.png",
    description: "German motor vehicle manufacturer",
    slug: "volkswagen",
    featured: false
  },
  {
    id: "14",
    name: "Volvo",
    logoUrl: "https://www.carlogos.org/car-logos/volvo-logo-2014-1500x1500.png",
    description: "Swedish luxury vehicle manufacturer",
    slug: "volvo",
    featured: false
  },
  {
    id: "15",
    name: "Jeep",
    logoUrl: "https://www.carlogos.org/car-logos/jeep-logo-2000-1920x1080.png",
    description: "American SUV and off-road vehicle brand",
    slug: "jeep",
    featured: false
  },
  
  {
    id: "16",
    name: "Peterbilt",
    logoUrl: "https://www.carlogos.org/logo/Peterbilt-logo-5500x1100.png",
    description: "American manufacturer of medium and heavy-duty trucks",
    slug: "peterbilt",
    featured: true
  },
  {
    id: "17",
    name: "Kenworth",
    logoUrl: "https://www.carlogos.org/car-logos/kenworth-logo-1200x1200.png",
    description: "American manufacturer of commercial vehicles",
    slug: "kenworth",
    featured: false
  },
  {
    id: "18",
    name: "Mack Trucks",
    logoUrl: "https://www.carlogos.org/car-logos/mack-logo-2200x500.png",
    description: "American truck manufacturing company",
    slug: "mack",
    featured: false
  },
  {
    id: "19",
    name: "Freightliner",
    logoUrl: "https://www.carlogos.org/car-logos/freightliner-logo-1200x400.png",
    description: "American truck manufacturer",
    slug: "freightliner",
    featured: false
  },
  {
    id: "20",
    name: "International",
    logoUrl: "https://www.carlogos.org/car-logos/international-trucks-logo-1200x900.png",
    description: "American manufacturer of heavy-duty trucks",
    slug: "international",
    featured: false
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
