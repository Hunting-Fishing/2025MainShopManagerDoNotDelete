
import React, { useState, useEffect } from 'react';
import { Container } from 'semantic-ui-react';
import CategoryGrid from '@/components/affiliate/CategoryGrid';
import HeroSection from '@/components/affiliate/HeroSection';
import SearchBar from '@/components/affiliate/SearchBar';
import BestSellingTools from '@/components/affiliate/BestSellingTools';
import ManufacturersGrid from '@/components/affiliate/ManufacturersGrid';
import FeaturedProductsSlider from '@/components/affiliate/FeaturedProductsSlider';
import { useQuery } from '@tanstack/react-query';
import { categories } from '@/data/toolCategories';
import { manufacturers } from '@/data/manufacturers';
import { supabase } from '@/lib/supabase';
import { AffiliateProduct } from '@/types/affiliate';

// Convert the categories dictionary to an array format for display
const categoryList = Object.keys(categories).map((name, id) => ({
  id: id.toString(),
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  description: `Professional-grade ${name.toLowerCase()} tools for automotive repair and maintenance.`,
  subcategories: categories[name].slice(0, 5), // Show only first 5 subcategories in preview
}));

// Mock featured products since we don't have a real API yet
const mockFeaturedProducts: AffiliateProduct[] = [
  {
    id: "tool1",
    name: "Premium Socket Set",
    description: "Complete socket set with ratchet and extensions",
    imageUrl: "https://images.unsplash.com/photo-1581147036324-c71f53614226?q=80&w=1374&auto=format&fit=crop",
    retailPrice: 129.99,
    affiliateUrl: "https://example.com/affiliate/socket-set",
    category: "Hand Tools",
    tier: "premium",
    rating: 4.8,
    reviewCount: 152,
    manufacturer: "Craftsman",
    model: "CS-500",
    discount: 15,
    isFeatured: true,
    bestSeller: true
  },
  {
    id: "tool2",
    name: "Digital Multimeter",
    description: "Professional digital multimeter with auto-ranging",
    imageUrl: "https://images.unsplash.com/photo-1576613109753-27804239b206?q=80&w=1470&auto=format&fit=crop",
    retailPrice: 89.99,
    affiliateUrl: "https://example.com/affiliate/multimeter",
    category: "Electronic Tools",
    tier: "midgrade",
    rating: 4.6,
    reviewCount: 98,
    manufacturer: "Fluke",
    model: "F-201",
    isFeatured: true
  },
  {
    id: "tool3",
    name: "Heavy-Duty Impact Wrench",
    description: "Powerful impact wrench for automotive applications",
    imageUrl: "https://images.unsplash.com/photo-1504222490345-c075b6008014?q=80&w=1470&auto=format&fit=crop",
    retailPrice: 199.99,
    affiliateUrl: "https://example.com/affiliate/impact-wrench",
    category: "Power Tools",
    tier: "premium",
    rating: 4.9,
    reviewCount: 215,
    manufacturer: "DeWalt",
    model: "DW-5500",
    discount: 10,
    isFeatured: true,
    bestSeller: true
  },
  {
    id: "tool4",
    name: "OBD-II Scanner",
    description: "Advanced diagnostic scanner for all vehicles",
    imageUrl: "https://images.unsplash.com/photo-1697470187626-90081f47ea22?q=80&w=1470&auto=format&fit=crop",
    retailPrice: 149.99,
    affiliateUrl: "https://example.com/affiliate/scanner",
    category: "Diagnostic Tools",
    tier: "premium",
    rating: 4.7,
    reviewCount: 187,
    manufacturer: "Autel",
    model: "AL619",
    discount: 5,
    isFeatured: true
  },
  {
    id: "tool5",
    name: "Mechanic's Tool Set (250pc)",
    description: "Complete mechanics tool set with storage case",
    imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=1470&auto=format&fit=crop",
    retailPrice: 299.99,
    affiliateUrl: "https://example.com/affiliate/tool-set",
    category: "Hand Tools",
    tier: "premium",
    rating: 4.8,
    reviewCount: 224,
    manufacturer: "Craftsman",
    model: "CMMT12345",
    isFeatured: true,
    freeShipping: true
  }
];

// Mock best selling products
const mockBestSellingProducts: AffiliateProduct[] = [
  {
    id: "tool6",
    name: "Professional Torque Wrench",
    description: "Precision torque wrench with digital display",
    imageUrl: "https://images.unsplash.com/photo-1616112078618-fc3d9a252212?q=80&w=1471&auto=format&fit=crop",
    retailPrice: 149.99,
    affiliateUrl: "https://example.com/affiliate/torque-wrench",
    category: "Hand Tools",
    tier: "premium",
    rating: 4.9,
    reviewCount: 132,
    manufacturer: "Snap-on",
    model: "TQ-1000D",
    bestSeller: true
  },
  {
    id: "tool7",
    name: "Air Compressor",
    description: "Portable air compressor for tools and inflation",
    imageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1374&auto=format&fit=crop",
    retailPrice: 199.99,
    affiliateUrl: "https://example.com/affiliate/air-compressor",
    category: "Power Tools",
    tier: "midgrade",
    rating: 4.7,
    reviewCount: 98,
    manufacturer: "California Air Tools",
    model: "CAT-10020",
    bestSeller: true,
    discount: 15
  },
  {
    id: "tool8",
    name: "LED Work Light",
    description: "Rechargeable LED work light with magnetic base",
    imageUrl: "https://images.unsplash.com/photo-1517420879524-86d64ac2f339?q=80&w=1426&auto=format&fit=crop",
    retailPrice: 59.99,
    affiliateUrl: "https://example.com/affiliate/work-light",
    category: "Shop Equipment",
    tier: "economy",
    rating: 4.5,
    reviewCount: 210,
    manufacturer: "Milwaukee",
    model: "2735-20",
    bestSeller: true
  },
  {
    id: "tool9",
    name: "Automotive Battery Tester",
    description: "Digital battery and electrical system analyzer",
    imageUrl: "https://images.unsplash.com/photo-1606676539940-12768ce0e762?q=80&w=1470&auto=format&fit=crop",
    retailPrice: 129.99,
    affiliateUrl: "https://example.com/affiliate/battery-tester",
    category: "Diagnostic Tools",
    tier: "midgrade",
    rating: 4.6,
    reviewCount: 85,
    manufacturer: "Foxwell",
    model: "BT-705",
    bestSeller: true
  }
];

const AffiliateTool = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch featured tools data
  const { data: featuredTools, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featuredTools'],
    queryFn: async () => {
      try {
        // In a real app, this would be an API call to fetch featured tools
        // For now, we're simulating a delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real implementation, we would fetch data from Supabase
        // const { data, error } = await supabase
        //   .from('products')
        //   .select('*')
        //   .eq('is_featured', true)
        //   .limit(10);
        
        // if (error) throw error;
        // return data;
        
        return mockFeaturedProducts;
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
        
        return mockBestSellingProducts;
      } catch (error) {
        console.error("Error fetching best selling tools:", error);
        throw error;
      }
    },
  });
  
  return (
    <Container fluid>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Featured Products Section */}
      <FeaturedProductsSlider 
        products={featuredTools} 
        isLoading={isFeaturedLoading}
        title="Featured Tools"
        subtitle="Professional-grade tools recommended by mechanics"
      />
      
      {/* Categories Grid */}
      <CategoryGrid categories={categoryList} />
      
      {/* Best Selling Tools */}
      <BestSellingTools tools={bestSellingTools} isLoading={isBestSellingLoading} />
      
      {/* Manufacturers Section */}
      <ManufacturersGrid manufacturers={manufacturers} />
    </Container>
  );
};

export default AffiliateTool;
