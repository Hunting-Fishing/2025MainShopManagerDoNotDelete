
import { Manufacturer } from "@/types/affiliate";

export const manufacturers: Manufacturer[] = [
  {
    id: "1",
    name: "SnapTech",
    logoUrl: "https://via.placeholder.com/150x80?text=SnapTech",
    description: "Premium automotive diagnostic tools and equipment",
    slug: "snaptech",
    featured: true
  },
  {
    id: "2",
    name: "PowerMaxx",
    logoUrl: "https://via.placeholder.com/150x80?text=PowerMaxx",
    description: "High-quality power tools for professionals",
    slug: "powermaxx",
    featured: true
  },
  {
    id: "3", 
    name: "PrecisionPro",
    logoUrl: "https://via.placeholder.com/150x80?text=PrecisionPro",
    description: "Precision measurement and calibration equipment",
    slug: "precisionpro",
    featured: true
  },
  {
    id: "4",
    name: "TorqueMaster",
    logoUrl: "https://via.placeholder.com/150x80?text=TorqueMaster",
    description: "Specialized torque wrenches and tools",
    slug: "torquemaster",
    featured: true
  },
  {
    id: "5",
    name: "EliteTools",
    logoUrl: "https://via.placeholder.com/150x80?text=EliteTools",
    description: "Premium automotive repair tools",
    slug: "elitetools",
    featured: true
  },
  {
    id: "6",
    name: "MechanicChoice",
    logoUrl: "https://via.placeholder.com/150x80?text=MechanicChoice",
    description: "Professional-grade mechanic tool sets",
    slug: "mechanicchoice",
    featured: false
  },
  {
    id: "7",
    name: "DiagnostX",
    logoUrl: "https://via.placeholder.com/150x80?text=DiagnostX", 
    description: "Advanced diagnostic scanners and software",
    slug: "diagnostx",
    featured: false
  },
  {
    id: "8",
    name: "ProLift",
    logoUrl: "https://via.placeholder.com/150x80?text=ProLift",
    description: "Professional lifting and jack equipment",
    slug: "prolift",
    featured: false
  }
];

// Sample manufacturer products data
export const generateManufacturerProducts = (manufacturerSlug: string) => {
  // Generate 12 products for the manufacturer
  return Array.from({ length: 12 }, (_, i) => ({
    id: `${manufacturerSlug}-product-${i + 1}`,
    name: `${manufacturerSlug.charAt(0).toUpperCase() + manufacturerSlug.slice(1)} Tool ${i + 1}`,
    description: `High quality tool from ${manufacturerSlug.charAt(0).toUpperCase() + manufacturerSlug.slice(1)}`,
    imageUrl: `https://via.placeholder.com/300x200?text=${manufacturerSlug}-tool-${i + 1}`,
    tier: i % 3 === 0 ? 'premium' : i % 3 === 1 ? 'midgrade' : 'economy',
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
  }));
};
