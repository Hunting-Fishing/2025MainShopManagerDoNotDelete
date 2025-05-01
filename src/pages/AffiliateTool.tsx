
import React, { useState } from 'react';
import { Container } from 'semantic-ui-react';
import CategoryGrid from '@/components/affiliate/CategoryGrid';
import HeroSection from '@/components/affiliate/HeroSection';
import SearchBar from '@/components/affiliate/SearchBar';
import FeaturedTools from '@/components/affiliate/FeaturedTools';
import BestSellingTools from '@/components/affiliate/BestSellingTools';
import ManufacturersGrid from '@/components/affiliate/ManufacturersGrid';
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

// Featured tools mock data
const featuredTools = [
  {
    id: "1",
    title: "Professional OBD-II Scanner",
    category: "Diagnostics",
    price: 189.99,
    rating: 4.8,
    reviewCount: 124,
    image: "https://via.placeholder.com/400x300?text=OBD-II+Scanner",
    isFeatured: true,
    discount: 15
  },
  {
    id: "2",
    title: "Master Brake Service Kit",
    category: "Brakes",
    price: 249.99,
    rating: 4.7,
    reviewCount: 98,
    image: "https://via.placeholder.com/400x300?text=Brake+Service+Kit",
    isFeatured: true,
    discount: 10
  },
  {
    id: "3",
    title: "Digital Multimeter Pro",
    category: "Electrical",
    price: 129.99,
    rating: 4.9,
    reviewCount: 156,
    image: "https://via.placeholder.com/400x300?text=Digital+Multimeter",
    isFeatured: true,
    discount: null
  },
  {
    id: "4",
    title: "Complete Engine Timing Tool Set",
    category: "Engine",
    price: 319.99,
    rating: 4.6,
    reviewCount: 87,
    image: "https://via.placeholder.com/400x300?text=Engine+Timing+Set",
    isFeatured: true,
    discount: 20
  }
];

// Best selling tools mock data
const bestSellingTools = [
  {
    id: "5",
    title: "10pc Screwdriver Set",
    category: "Hand Tools",
    price: 39.99,
    rating: 4.5,
    reviewCount: 312,
    image: "https://via.placeholder.com/400x300?text=Screwdriver+Set",
    bestSeller: true
  },
  {
    id: "6", 
    title: "Brake Caliper Tool Kit",
    category: "Brakes",
    price: 64.99,
    rating: 4.6,
    reviewCount: 178,
    image: "https://via.placeholder.com/400x300?text=Caliper+Tool",
    bestSeller: true
  },
  {
    id: "7",
    title: "Oil Filter Wrench Set",
    category: "Engine",
    price: 28.99,
    rating: 4.4,
    reviewCount: 245,
    image: "https://via.placeholder.com/400x300?text=Filter+Wrench",
    bestSeller: true
  },
  {
    id: "8",
    title: "Compression Tester Kit",
    category: "Diagnostics",
    price: 47.99,
    rating: 4.7,
    reviewCount: 163,
    image: "https://via.placeholder.com/400x300?text=Compression+Tester",
    bestSeller: true
  }
];

const AffiliateTool = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
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
