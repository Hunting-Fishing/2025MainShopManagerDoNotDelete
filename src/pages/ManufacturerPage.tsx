
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Header as SemanticHeader, Segment, Grid } from 'semantic-ui-react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, Breadcrumb } from '@/components/ui/breadcrumb';
import { Search, Settings, Star, Sliders, ShoppingCart } from "lucide-react";
import { manufacturers, generateManufacturerProducts } from '@/data/manufacturers';
import { AffiliateProduct } from '@/types/affiliate';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

export default function ManufacturerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [manufacturer, setManufacturer] = useState<any>(null);
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<AffiliateProduct[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [engineFilter, setEngineFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  
  useEffect(() => {
    // Find manufacturer
    const found = manufacturers.find(m => m.slug === slug);
    if (found) {
      setManufacturer(found);
      
      // Generate products for this manufacturer
      const manufacturerProducts = generateManufacturerProducts(slug as string);
      setProducts(manufacturerProducts);
      setFilteredProducts(manufacturerProducts);
    }
  }, [slug]);
  
  // Extract unique values for filter dropdowns
  const getUniqueValues = (field: keyof AffiliateProduct) => {
    const values = products.map(p => p[field]);
    return Array.from(new Set(values)).filter(Boolean);
  };
  
  const uniqueCategories = getUniqueValues('category') as string[];
  const uniqueModels = getUniqueValues('model') as string[];
  const uniqueEngineTypes = getUniqueValues('engineType') as string[];
  
  // Apply filters when any filter changes
  useEffect(() => {
    if (products.length) {
      let result = [...products];
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(p => 
          p.name.toLowerCase().includes(term) || 
          p.description.toLowerCase().includes(term)
        );
      }
      
      // Apply category filter
      if (categoryFilter !== "all") {
        result = result.filter(p => p.category === categoryFilter);
      }
      
      // Apply model filter
      if (modelFilter !== "all") {
        result = result.filter(p => p.model === modelFilter);
      }
      
      // Apply engine type filter
      if (engineFilter !== "all") {
        result = result.filter(p => p.engineType === engineFilter);
      }
      
      // Apply tier filter
      if (tierFilter !== "all") {
        result = result.filter(p => p.tier === tierFilter);
      }
      
      setFilteredProducts(result);
    }
  }, [searchTerm, categoryFilter, modelFilter, engineFilter, tierFilter, products]);

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setModelFilter("all");
    setEngineFilter("all");
    setTierFilter("all");
  };
  
  // Get tier badge color
  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'premium': return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'midgrade': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'economy': return 'bg-green-100 text-green-800 border border-green-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };
  
  if (!manufacturer) {
    return (
      <Container>
        <Segment placeholder className="my-8">
          <SemanticHeader icon>
            <Settings />
            Manufacturer not found
          </SemanticHeader>
          <Button asChild>
            <Link to="/tools">Back to Tools</Link>
          </Button>
        </Segment>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header with manufacturer info */}
      <Segment raised className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-6 border-l-4 border-blue-500">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/tools">Tool Shop</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{manufacturer.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Grid stackable columns={2} className="mt-6">
          <Grid.Column width={4}>
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-center">
              <img 
                src={manufacturer.logoUrl} 
                alt={manufacturer.name} 
                className="max-h-32 max-w-full"
              />
            </div>
          </Grid.Column>
          <Grid.Column width={12}>
            <SemanticHeader as="h1" className="text-3xl font-bold mb-2">
              {manufacturer.name} Tools
            </SemanticHeader>
            <p className="text-lg text-gray-600 mb-4">{manufacturer.description}</p>
            <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
              {filteredProducts.length} Products
            </Badge>
          </Grid.Column>
        </Grid>
      </Segment>

      {/* Filters */}
      <Segment className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Model Filter */}
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {uniqueModels.map(model => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Engine Type Filter */}
            <Select value={engineFilter} onValueChange={setEngineFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Engine Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Engines</SelectItem>
                {uniqueEngineTypes.map(engine => (
                  <SelectItem key={engine} value={engine}>
                    {engine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Tier Filter */}
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Quality Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="midgrade">Mid-grade</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Segment>

      {/* Products Grid */}
      <Segment>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <SemanticHeader as="h3">No products match your filters</SemanticHeader>
            <p className="mb-4">Try changing your search criteria</p>
            <Button onClick={resetFilters}>Clear All Filters</Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <ResponsiveGrid
              cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
              gap="md"
              className="pb-4"
            >
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-blue-500 overflow-hidden">
                  <Link to={`/tools/${product.category?.toLowerCase()}/${product.id}`}>
                    <CardContent className="p-0 relative">
                      <div className="absolute top-2 right-2">
                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${getTierColor(product.tier)}`}>
                          {product.tier.charAt(0).toUpperCase() + product.tier.slice(1)}
                        </span>
                      </div>
                      {product.discount && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-red-100 text-red-800 border border-red-300">
                            {product.discount}% OFF
                          </Badge>
                        </div>
                      )}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-[180px] object-cover"
                      />
                      <div className="p-4">
                        <p className="font-medium mb-1">{product.name}</p>
                        <Badge variant="outline" className="mb-2 text-xs">{product.category}</Badge>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-blue-600 font-bold">${product.retailPrice.toFixed(2)}</span>
                          {product.rating && (
                            <span className="text-sm text-gray-600 flex items-center">
                              <Star size={14} className="text-yellow-500 mr-1 fill-yellow-500" /> 
                              {product.rating.toFixed(1)} 
                              {product.reviewCount && `(${product.reviewCount})`}
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs mr-1">{product.model}</Badge>
                          {product.engineType && (
                            <Badge variant="outline" className="text-xs">{product.engineType}</Badge>
                          )}
                        </div>
                        <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                          <ShoppingCart size={16} className="mr-1" /> View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </ResponsiveGrid>
          </ScrollArea>
        )}
      </Segment>
    </Container>
  );
}
