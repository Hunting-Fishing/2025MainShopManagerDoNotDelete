
import React, { useState } from 'react';
import { Container } from 'semantic-ui-react';
import CategoryGrid from '@/components/affiliate/CategoryGrid';
import HeroSection from '@/components/affiliate/HeroSection';
import SearchBar from '@/components/affiliate/SearchBar';
import FeaturedTools from '@/components/affiliate/FeaturedTools';
import BestSellingTools from '@/components/affiliate/BestSellingTools';
import ManufacturersGrid from '@/components/affiliate/ManufacturersGrid';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';
import { categories } from '@/data/toolCategories';
import { manufacturers } from '@/data/manufacturers';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database } from 'lucide-react';
import { AffiliateTool, AffiliateProduct } from '@/types/affiliate';

// Convert the categories dictionary to an array format for display
const categoryList = Object.keys(categories).map((name, id) => ({
  id: id.toString(),
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  description: `Professional-grade ${name.toLowerCase()} tools for automotive repair and maintenance.`,
  subcategories: categories[name].slice(0, 5), // Show only first 5 subcategories in preview
}));

// Transform AffiliateTool to AffiliateProduct
const transformToAffiliateProduct = (tool: AffiliateTool): AffiliateProduct => ({
  id: tool.id,
  name: tool.name,
  description: tool.description,
  imageUrl: tool.imageUrl || '',
  retailPrice: tool.price || 0,
  affiliateUrl: tool.affiliateLink,
  category: tool.category,
  tier: 'midgrade', // Default tier since not available in AffiliateTool
  rating: tool.rating,
  reviewCount: tool.reviewCount,
  manufacturer: tool.manufacturer,
  model: tool.name, // Use name as model since model field doesn't exist
  discount: tool.salePrice ? Math.round(((tool.price || 0) - tool.salePrice) / (tool.price || 1) * 100) : undefined,
  isFeatured: tool.featured,
  bestSeller: tool.bestSeller,
  freeShipping: false, // Default value
  source: 'other' // Default value
});

export default function Shopping() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use the real products manager hook instead of mock queries
  const { products, loading, error } = useProductsManager();
  
  // Filter products for featured and best selling sections and transform them
  const featuredTools = products
    .filter(product => product.featured)
    .map(transformToAffiliateProduct);
  
  const bestSellingTools = products
    .filter(product => product.bestSeller)
    .map(transformToAffiliateProduct);
  
  // Show error state if there's an issue loading products
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Error loading products from database: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          All shopping data is live from your Supabase database. Showing {products.length} real products.
        </AlertDescription>
      </Alert>

      <Container fluid>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Search Bar */}
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Featured Products Section */}
        <FeaturedTools tools={featuredTools} isLoading={loading} />
        
        {/* Categories Grid */}
        <CategoryGrid categories={categoryList} />
        
        {/* Best Selling Tools */}
        <BestSellingTools tools={bestSellingTools} isLoading={loading} />
        
        {/* Manufacturers Section */}
        <ManufacturersGrid manufacturers={manufacturers} />
      </Container>
    </div>
  );
}
