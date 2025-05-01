
import { AffiliateProduct } from '@/types/affiliate';
import { manufacturers } from './index';

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
