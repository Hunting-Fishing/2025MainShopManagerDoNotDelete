
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

// Convert the categories dictionary to an array format for display
const categoryList = Object.keys(categories).map((name, id) => ({
  id: id.toString(),
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  description: `Professional-grade ${name.toLowerCase()} tools for automotive repair and maintenance.`,
  subcategories: categories[name].slice(0, 5), // Show only first 5 subcategories in preview
}));

export default function Shopping() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use the real products manager hook instead of mock queries
  const { products, loading, error } = useProductsManager();
  
  // Filter products for featured and best selling sections
  const featuredTools = products.filter(product => product.featured);
  const bestSellingTools = products.filter(product => product.bestSeller);
  
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
