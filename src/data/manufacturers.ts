
import { Manufacturer, AffiliateProduct, ProductTier } from "@/types/affiliate";

export const manufacturers: Manufacturer[] = [
  {
    id: "1",
    name: "Toyota",
    logoUrl: "https://via.placeholder.com/150x80?text=Toyota",
    description: "Japanese automotive manufacturer",
    slug: "toyota",
    featured: true
  },
  {
    id: "2",
    name: "Honda",
    logoUrl: "https://via.placeholder.com/150x80?text=Honda",
    description: "Japanese automotive and motorcycle manufacturer",
    slug: "honda",
    featured: true
  },
  {
    id: "3", 
    name: "Ford",
    logoUrl: "https://via.placeholder.com/150x80?text=Ford",
    description: "American multinational automaker",
    slug: "ford",
    featured: true
  },
  {
    id: "4",
    name: "Chevrolet",
    logoUrl: "https://via.placeholder.com/150x80?text=Chevrolet",
    description: "American automobile division of GM",
    slug: "chevrolet",
    featured: true
  },
  {
    id: "5",
    name: "BMW",
    logoUrl: "https://via.placeholder.com/150x80?text=BMW",
    description: "German luxury vehicle manufacturer",
    slug: "bmw",
    featured: true
  },
  {
    id: "6",
    name: "Mercedes-Benz",
    logoUrl: "https://via.placeholder.com/150x80?text=Mercedes",
    description: "German luxury automobile manufacturer",
    slug: "mercedes",
    featured: false
  },
  {
    id: "7",
    name: "Audi",
    logoUrl: "https://via.placeholder.com/150x80?text=Audi", 
    description: "German luxury vehicle manufacturer",
    slug: "audi",
    featured: false
  },
  {
    id: "8",
    name: "Hyundai",
    logoUrl: "https://via.placeholder.com/150x80?text=Hyundai",
    description: "South Korean multinational automaker",
    slug: "hyundai",
    featured: false
  },
  {
    id: "9",
    name: "Kia",
    logoUrl: "https://via.placeholder.com/150x80?text=Kia",
    description: "South Korean multinational automaker",
    slug: "kia",
    featured: false
  },
  {
    id: "10",
    name: "Nissan",
    logoUrl: "https://via.placeholder.com/150x80?text=Nissan",
    description: "Japanese multinational automobile manufacturer",
    slug: "nissan",
    featured: false
  },
  {
    id: "11",
    name: "Subaru",
    logoUrl: "https://via.placeholder.com/150x80?text=Subaru",
    description: "Japanese automobile manufacturer",
    slug: "subaru",
    featured: false
  },
  {
    id: "12",
    name: "Mazda",
    logoUrl: "https://via.placeholder.com/150x80?text=Mazda",
    description: "Japanese automaker based in Hiroshima",
    slug: "mazda",
    featured: false
  },
  {
    id: "13",
    name: "Volkswagen",
    logoUrl: "https://via.placeholder.com/150x80?text=VW",
    description: "German motor vehicle manufacturer",
    slug: "volkswagen",
    featured: false
  },
  {
    id: "14",
    name: "Volvo",
    logoUrl: "https://via.placeholder.com/150x80?text=Volvo",
    description: "Swedish luxury vehicle manufacturer",
    slug: "volvo",
    featured: false
  },
  {
    id: "15",
    name: "Jeep",
    logoUrl: "https://via.placeholder.com/150x80?text=Jeep",
    description: "American SUV and off-road vehicle brand",
    slug: "jeep",
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
