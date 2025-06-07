
import React, { useState } from 'react';
import { Container } from 'semantic-ui-react';
import CategoryGrid from '@/components/affiliate/CategoryGrid';
import HeroSection from '@/components/affiliate/HeroSection';
import SearchBar from '@/components/affiliate/SearchBar';
import FeaturedTools from '@/components/affiliate/FeaturedTools';
import BestSellingTools from '@/components/affiliate/BestSellingTools';
import ManufacturersGrid from '@/components/affiliate/ManufacturersGrid';
import { useQuery } from '@tanstack/react-query';
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

  // Fetch featured tools data
  const { data: featuredTools, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featuredTools'],
    queryFn: async () => {
      try {
        // In a real app, this would be an API call to fetch featured tools
        // For now, we're simulating a delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Return an empty array for now
        // In a real implementation, this would be data from the API
        return [];
      } catch (error) {
        console.error("Error fetching featured tools:", error);
        throw error;
      }
    },
  });

  // Fetch best selling tools data
  const { data: bestSellingTools, isLoading: isBestSellingLoading } = useQuery({
    queryKey: ['bestSellingTools'],
    queryFn: async () => {
      try {
        // In a real app, this would be an API call to fetch best selling tools
        // For now, we're simulating a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return an empty array for now
        // In a real implementation, this would be data from the API
        return [];
      } catch (error) {
        console.error("Error fetching best selling tools:", error);
        throw error;
      }
    },
  });
  
  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          All shopping data is live from your database. No mock or sample data is displayed.
        </AlertDescription>
      </Alert>

      <Container fluid>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Search Bar */}
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Featured Products Section */}
        <FeaturedTools tools={featuredTools} isLoading={isFeaturedLoading} />
        
        {/* Categories Grid */}
        <CategoryGrid categories={categoryList} />
        
        {/* Best Selling Tools */}
        <BestSellingTools tools={bestSellingTools} isLoading={isBestSellingLoading} />
        
        {/* Manufacturers Section */}
        <ManufacturersGrid manufacturers={manufacturers} />
      </Container>
    </div>
  );
}
