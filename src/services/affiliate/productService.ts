
import { AffiliateTool, AffiliateProduct } from "@/types/affiliate";

/**
 * Mock service for managing affiliate products
 * In a real implementation, these functions would interact with your backend
 */

// Mock function to get products by category
export const getProductsByCategory = async (category: string): Promise<AffiliateTool[]> => {
  console.log(`Fetching products for category: ${category}`);
  // This would be replaced with an actual API call
  // For now, return mock data
  return [
    {
      id: "t1",
      name: "Premium Socket Set",
      description: "Complete socket set with ratchet and extensions",
      slug: "premium-socket-set",
      price: 129.99,
      salePrice: 99.99,
      imageUrl: "https://example.com/images/socket-set.jpg",
      category: "Engine",
      manufacturer: "Craftsman",
      rating: 4.8,
      reviewCount: 152,
      featured: true,
      bestSeller: true,
      affiliateLink: "https://example.com/affiliate/socket-set"
    },
    {
      id: "t2",
      name: "Torque Wrench",
      description: "Precision torque wrench with digital display",
      slug: "torque-wrench",
      price: 89.99,
      imageUrl: "https://example.com/images/torque-wrench.jpg",
      category: "Engine",
      manufacturer: "Snap-on",
      rating: 4.6,
      reviewCount: 98,
      featured: false,
      bestSeller: false,
      affiliateLink: "https://example.com/affiliate/torque-wrench"
    },
    {
      id: "t3",
      name: "OBD-II Scanner",
      description: "Advanced diagnostic scanner for all vehicles",
      slug: "obd-ii-scanner",
      price: 149.99,
      salePrice: 129.99,
      imageUrl: "https://example.com/images/scanner.jpg",
      category: "Diagnostics",
      manufacturer: "Autel",
      rating: 4.9,
      reviewCount: 215,
      featured: true,
      bestSeller: true,
      affiliateLink: "https://example.com/affiliate/scanner"
    }
  ].filter(product => product.category === category);
};

// Mock function to get products by manufacturer
export const getProductsByManufacturer = async (manufacturer: string): Promise<AffiliateTool[]> => {
  console.log(`Fetching products for manufacturer: ${manufacturer}`);
  // This would be replaced with an actual API call
  return [];
};

// Mock function to get products in a featured group
export const getProductsByFeaturedGroup = async (groupId: string): Promise<AffiliateTool[]> => {
  console.log(`Fetching products for featured group: ${groupId}`);
  // This would be replaced with an actual API call
  return [];
};

// Mock function to update a product
export const updateProduct = async (product: AffiliateTool | AffiliateProduct): Promise<AffiliateTool | AffiliateProduct> => {
  console.log(`Updating product: ${product.id}`, product);
  // This would make an API call to update the product
  return product;
};

// Mock function to get price history for a product
export const getProductPriceHistory = async (productId: string): Promise<any[]> => {
  console.log(`Fetching price history for product: ${productId}`);
  // This would make an API call to get price history
  return [
    { date: "2025-04-01", price: 129.99, salePrice: 99.99 },
    { date: "2025-03-01", price: 139.99, salePrice: 109.99 },
    { date: "2025-02-01", price: 149.99, salePrice: null },
  ];
};
