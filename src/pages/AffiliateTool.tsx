
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

// Convert the categories dictionary to an array format for display
const categoryList = Object.keys(categories).map((name, id) => ({
  id: id.toString(),
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  description: `Professional-grade ${name.toLowerCase()} tools for automotive repair and maintenance.`,
  subcategories: categories[name].slice(0, 5), // Show only first 5 subcategories in preview
}));

// Interface definitions for our data
interface Tool {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  isFeatured?: boolean;
  bestSeller?: boolean;
  discount?: number | null;
}

const AffiliateTool = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch featured tools data
  const { data: featuredTools, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featuredTools'],
    queryFn: async () => {
      // In a real app, this would be an API call to fetch featured tools
      // For now, we'll return an empty array as a placeholder
      // The component will handle the loading state internally
      return [] as Tool[];
    },
  });

  // Fetch best selling tools data
  const { data: bestSellingTools, isLoading: isBestSellingLoading } = useQuery({
    queryKey: ['bestSellingTools'],
    queryFn: async () => {
      // In a real app, this would be an API call to fetch best selling tools
      // For now, we'll return an empty array as a placeholder
      // The component will handle the loading state internally
      return [] as Tool[];
    },
  });
  
  return (
    <Container fluid>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Featured Products Section */}
      <FeaturedTools tools={featuredTools} />
      
      {/* Categories Grid */}
      <CategoryGrid categories={categoryList} />
      
      {/* Best Selling Tools */}
      <BestSellingTools tools={bestSellingTools} />
      
      {/* Manufacturers Section */}
      <ManufacturersGrid manufacturers={manufacturers} />
    </Container>
  );
};

export default AffiliateTool;
