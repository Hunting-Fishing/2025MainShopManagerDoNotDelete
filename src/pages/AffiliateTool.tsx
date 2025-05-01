
import React, { useState } from 'react';
import { Container, Segment, Header, Grid } from 'semantic-ui-react';
import CategoryGrid from '@/components/affiliate/CategoryGrid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tool, Search, Star, Tag, Sparkles, ShoppingCart, TrendingUp } from 'lucide-react';
import { categories } from '@/data/toolCategories';

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
      <Segment className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-lg mb-6">
        <Grid stackable>
          <Grid.Column width={10}>
            <Header as="h1" className="text-4xl font-bold mb-2">
              Professional Auto Repair Tools
            </Header>
            <p className="text-xl opacity-90 mb-6">
              Find the right tools for every automotive repair and maintenance job. 
              Shop our collection of professional-grade tools trusted by mechanics worldwide.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button className="bg-white text-blue-700 hover:bg-gray-100 hover:text-blue-800">
                Shop All Categories
              </Button>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                View Deals
              </Button>
            </div>
          </Grid.Column>
          <Grid.Column width={6} className="flex items-center justify-center">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm border border-white/20 shadow-xl">
              <Tool size={120} className="text-white" />
            </div>
          </Grid.Column>
        </Grid>
      </Segment>
      
      {/* Search Bar */}
      <Segment className="mb-6 shadow-sm border border-gray-200">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search for tools by name, category, or part number..." 
              className="pl-10 pr-4 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Search
          </Button>
        </div>
      </Segment>

      {/* Featured Products Section */}
      <Segment className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400">
        <Header as="h2" className="text-2xl font-semibold mb-4 flex items-center">
          <Sparkles className="mr-2 text-amber-500" />
          Featured Tools
        </Header>
        <Grid columns={4} stackable doubling>
          {featuredTools.map(tool => (
            <Grid.Column key={tool.id}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-amber-500">
                <CardContent className="p-0 relative">
                  {tool.discount && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-100 text-red-800 border border-red-300">
                        {tool.discount}% OFF
                      </Badge>
                    </div>
                  )}
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-[180px] object-cover"
                  />
                  <div className="p-4">
                    <p className="font-medium mb-1">{tool.title}</p>
                    <Badge variant="outline" className="mb-2 text-xs">{tool.category}</Badge>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-blue-600 font-bold">${tool.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Star size={14} className="text-yellow-500 mr-1 fill-yellow-500" /> {tool.rating} ({tool.reviewCount})
                      </span>
                    </div>
                    <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                      <ShoppingCart size={16} className="mr-1" /> View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid.Column>
          ))}
        </Grid>
      </Segment>
      
      {/* Categories Grid */}
      <CategoryGrid categories={categoryList} />
      
      {/* Best Selling Tools */}
      <Segment className="mt-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
        <Header as="h2" className="text-2xl font-semibold mb-4 flex items-center">
          <TrendingUp className="mr-2 text-green-600" />
          Best Selling Tools
        </Header>
        <Grid columns={4} stackable doubling>
          {bestSellingTools.map(tool => (
            <Grid.Column key={tool.id}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-green-500">
                <CardContent className="p-0 relative">
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-green-100 text-green-800 border border-green-300">
                      Best Seller
                    </Badge>
                  </div>
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-[180px] object-cover"
                  />
                  <div className="p-4">
                    <p className="font-medium mb-1">{tool.title}</p>
                    <Badge variant="outline" className="mb-2 text-xs">{tool.category}</Badge>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-blue-600 font-bold">${tool.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Star size={14} className="text-yellow-500 mr-1 fill-yellow-500" /> {tool.rating} ({tool.reviewCount})
                      </span>
                    </div>
                    <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                      <ShoppingCart size={16} className="mr-1" /> View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid.Column>
          ))}
        </Grid>
      </Segment>
      
      {/* Call to Action */}
      <Segment className="mt-8 mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-lg text-center">
        <Header as="h2" className="text-3xl font-bold mb-2">
          Get the Right Tools for the Job
        </Header>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          Browse our extensive collection of professional-grade automotive tools.
          Free shipping on orders over $100!
        </p>
        <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 hover:text-blue-800">
          Shop All Tools
        </Button>
      </Segment>
    </Container>
  );
};

export default AffiliateTool;
