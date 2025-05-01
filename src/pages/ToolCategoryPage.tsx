
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Container, Header as SemanticHeader, Segment, Breadcrumb, Icon } from 'semantic-ui-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Sliders, Star, Tag, Wrench } from "lucide-react";

// Import the categories data
import { categories } from '@/data/toolCategories';

// Generate structured product data with ratings, prices and tier
const generateProductData = (subcategory: string) => Array.from({ length: 8 }, (_, i) => {
  const tier = i % 3 === 0 ? 'premium' : i % 3 === 1 ? 'midgrade' : 'economy';
  const price = tier === 'premium' 
    ? ((i + 1) * 29.99 + 49.99).toFixed(2)
    : tier === 'midgrade' 
      ? ((i + 1) * 19.99 + 29.99).toFixed(2) 
      : ((i + 1) * 9.99 + 19.99).toFixed(2);
  
  return {
    id: `${subcategory.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
    title: `${subcategory} #${i + 1}`,
    img: `https://via.placeholder.com/300x200?text=${encodeURIComponent(subcategory)}+${i + 1}`,
    price,
    tier,
    rating: (Math.random() * 2 + 3).toFixed(1),
    inStock: Math.random() > 0.2,
    link: "#",
  };
});

// Map of category to icon
const categoryIcons: { [key: string]: any } = {
  Engine: <Icon name="cog" />,
  Brakes: <Icon name="stop" />,
  "Steering & Suspension": <Icon name="wrench" />,
  Diagnostics: <Icon name="dashboard" />,
  Electrical: <Icon name="plug" />,
  Heating: <Icon name="fire" />,
  Cooling: <Icon name="snowflake outline" />,
  Drivetrain: <Icon name="cogs" />,
  Exhaust: <Icon name="cloud" />,
  Fuel: <Icon name="tint" />,
  Body: <Icon name="car" />
};

// Get color for tier
const getTierColor = (tier: string) => {
  switch(tier) {
    case 'premium': return 'bg-purple-100 text-purple-800 border border-purple-300';
    case 'midgrade': return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'economy': return 'bg-green-100 text-green-800 border border-green-300';
    default: return 'bg-gray-100 text-gray-800 border border-gray-300';
  }
};

export default function ToolCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [categoryTitle, setCategoryTitle] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  
  useEffect(() => {
    // Find the matching category and set the subcategories
    const categoryKey = Object.keys(categories).find(
      key => key.toLowerCase().replace(/\s+/g, '-') === category
    );
    
    if (categoryKey) {
      setSubcategories(categories[categoryKey]);
      setCategoryTitle(categoryKey);
    }
    
    // Reset filters when category changes
    setSearchTerm("");
    setPriceFilter(null);
    setTierFilter(null);
  }, [category]);

  if (!subcategories.length) {
    return (
      <Container fluid>
        <Segment placeholder>
          <SemanticHeader icon>
            <Icon name="search" />
            Category not found
          </SemanticHeader>
          <Segment.Inline>
            <Link to="/tools" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Back to All Categories
            </Link>
          </Segment.Inline>
        </Segment>
      </Container>
    );
  }

  // Filter products by search term and other filters
  const filterProducts = (products: any[], subcategory: string) => {
    return products.filter(product => {
      const matchesSearch = searchTerm === "" || 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcategory.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesPriceFilter = !priceFilter || 
        (priceFilter === 'low' && parseFloat(product.price) < 50) ||
        (priceFilter === 'medium' && parseFloat(product.price) >= 50 && parseFloat(product.price) < 100) ||
        (priceFilter === 'high' && parseFloat(product.price) >= 100);
        
      const matchesTierFilter = !tierFilter || product.tier === tierFilter;
      
      return matchesSearch && matchesPriceFilter && matchesTierFilter;
    });
  };
  
  const hasActiveFilters = searchTerm !== "" || priceFilter !== null || tierFilter !== null;

  return (
    <Container fluid>
      <Segment raised className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-6 mb-6 border-l-4 border-blue-500">
        <Breadcrumb size='large'>
          <Breadcrumb.Section link as={Link} to="/tools">Tool Categories</Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>{categoryTitle}</Breadcrumb.Section>
        </Breadcrumb>
        
        <div className="mt-4">
          <SemanticHeader as="h1" className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
            {categoryIcons[categoryTitle]} 
            <span className="ml-2">{categoryTitle} Tools</span>
            <SemanticHeader.Subheader className="text-slate-600 dark:text-slate-300 ml-8">
              Professional-grade {categoryTitle.toLowerCase()} tools for automotive repair and maintenance
            </SemanticHeader.Subheader>
          </SemanticHeader>
        </div>
      </Segment>

      {/* Floating Filters */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-4 shadow-sm border border-gray-200 rounded-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search tools..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Tabs value={priceFilter || ""} onValueChange={(v) => setPriceFilter(v === "" ? null : v)}>
            <TabsList className="h-10">
              <TabsTrigger value="" className="px-3 text-xs">All Prices</TabsTrigger>
              <TabsTrigger value="low" className="px-3 text-xs">Under $50</TabsTrigger>
              <TabsTrigger value="medium" className="px-3 text-xs">$50-$100</TabsTrigger>
              <TabsTrigger value="high" className="px-3 text-xs">$100+</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs value={tierFilter || ""} onValueChange={(v) => setTierFilter(v === "" ? null : v)}>
            <TabsList className="h-10">
              <TabsTrigger value="" className="px-3 text-xs">All Tiers</TabsTrigger>
              <TabsTrigger value="premium" className="px-3 text-xs">Premium</TabsTrigger>
              <TabsTrigger value="midgrade" className="px-3 text-xs">Mid-grade</TabsTrigger>
              <TabsTrigger value="economy" className="px-3 text-xs">Economy</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSearchTerm("");
              setPriceFilter(null);
              setTierFilter(null);
            }}
            className="ml-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-15rem)]">
        {subcategories.map((subcategory) => {
          const products = generateProductData(subcategory);
          const filteredProducts = filterProducts(products, subcategory);
          
          // Skip rendering this subcategory if no products match the filters
          if (filteredProducts.length === 0 && hasActiveFilters) return null;
          
          return (
            <div key={subcategory} className="mb-10">
              <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-blue-50 to-transparent p-2 rounded-lg dark:from-slate-800 dark:to-transparent border-l-4 border-blue-400">
                <div className="p-2 bg-blue-100 dark:bg-slate-700 rounded-lg shadow-sm">
                  <Wrench className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">{subcategory}</h2>
                <Badge variant="outline" className="ml-auto">{filteredProducts.length} tools</Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-blue-500 overflow-hidden">
                    <Link to={`/tools/${category}/${item.id}`}>
                      <CardContent className="p-0 relative">
                        <div className="absolute top-2 right-2">
                          <span className={`text-sm px-2 py-1 rounded-full font-medium ${getTierColor(item.tier)}`}>
                            {item.tier.charAt(0).toUpperCase() + item.tier.slice(1)}
                          </span>
                        </div>
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-[180px] object-cover"
                        />
                        <div className="p-4">
                          <p className="font-medium mb-1">{item.title}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-blue-600 font-bold">${item.price}</span>
                            <span className="text-sm text-gray-600 flex items-center">
                              <Star size={14} className="text-yellow-500 mr-1 fill-yellow-500" /> {item.rating}
                            </span>
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <Badge 
                              className={item.inStock ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"}
                            >
                              {item.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                            <Button size="sm" variant="outline" className="text-xs">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </Container>
  );
}
