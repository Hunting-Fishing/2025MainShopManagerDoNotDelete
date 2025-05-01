
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Segment, Header, Grid } from 'semantic-ui-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, ShoppingCart, Filter, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { manufacturers, generateManufacturerProducts } from '@/data/manufacturers';
import { Manufacturer, AffiliateProduct } from '@/types/affiliate';
import ProductTierBadge from '@/components/affiliate/ProductTierBadge';

const ManufacturerPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AffiliateProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [engineFilter, setEngineFilter] = useState('');

  useEffect(() => {
    // Find the manufacturer by slug
    const foundManufacturer = manufacturers.find(m => m.slug === slug);
    if (foundManufacturer) {
      setManufacturer(foundManufacturer);
      
      // Generate products for this manufacturer
      const manufacturerProducts = generateManufacturerProducts(foundManufacturer.slug);
      setProducts(manufacturerProducts);
      setFilteredProducts(manufacturerProducts);
    }
  }, [slug]);

  // Filter products when any filter changes
  useEffect(() => {
    if (products.length) {
      let filtered = [...products];
      
      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply category filter
      if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
      }
      
      // Apply tier filter
      if (tierFilter) {
        filtered = filtered.filter(p => p.tier === tierFilter);
      }
      
      // Apply model filter
      if (modelFilter) {
        filtered = filtered.filter(p => p.model === modelFilter);
      }
      
      // Apply engine filter
      if (engineFilter) {
        filtered = filtered.filter(p => p.engineType === engineFilter);
      }
      
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery, categoryFilter, tierFilter, modelFilter, engineFilter]);

  // Extract unique values for filters
  const categories = [...new Set(products.map(p => p.category))];
  const tiers = [...new Set(products.map(p => p.tier))];
  const models = [...new Set(products.map(p => p.model))];
  const engines = [...new Set(products.map(p => p.engineType))];

  if (!manufacturer) {
    return (
      <Container>
        <Segment className="p-8 text-center">
          <Header as="h2">Manufacturer not found</Header>
          <Link to="/tools">Back to Tools</Link>
        </Segment>
      </Container>
    );
  }

  return (
    <Container fluid className="py-6">
      {/* Manufacturer Header */}
      <Segment className="mb-6 bg-white shadow-sm rounded-lg">
        <Link to="/tools" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> 
          Back to Tool Shop
        </Link>
        
        <div className="flex flex-col md:flex-row items-center gap-6 p-4">
          <div className="bg-gray-50 p-6 rounded-lg flex items-center justify-center h-32 w-32 md:h-40 md:w-40">
            <img 
              src={manufacturer.logoUrl} 
              alt={manufacturer.name} 
              className="max-h-32 max-w-full"
            />
          </div>
          
          <div>
            <Header as="h1" className="text-3xl font-bold mb-2">
              {manufacturer.name} Tools & Equipment
            </Header>
            <p className="text-lg text-gray-600 mb-4">
              {manufacturer.description}
            </p>
            <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
              Official Dealer
            </Badge>
          </div>
        </div>
      </Segment>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <div className="lg:w-1/4">
          <Segment className="bg-white shadow-sm rounded-lg p-4">
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-3 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-gray-600" />
                Filters
              </h3>
              
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Tier Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality Tier
                  </label>
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Tiers</SelectItem>
                      {tiers.map((tier) => (
                        <SelectItem key={tier} value={tier}>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Model Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <Select value={modelFilter} onValueChange={setModelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Models" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Models</SelectItem>
                      {models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Engine Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Type
                  </label>
                  <Select value={engineFilter} onValueChange={setEngineFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Engine Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Engine Types</SelectItem>
                      {engines.map((engine) => (
                        <SelectItem key={engine} value={engine}>
                          {engine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('');
                    setTierFilter('');
                    setModelFilter('');
                    setEngineFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Segment>
        </div>
        
        {/* Product Grid */}
        <div className="lg:w-3/4">
          <div className="bg-white shadow-sm rounded-lg p-4">
            <Header as="h2" className="text-xl font-semibold mb-4">
              {filteredProducts.length} Products Available
            </Header>
            
            <Grid columns={3} stackable doubling>
              {filteredProducts.map((product) => (
                <Grid.Column key={product.id}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border">
                    <CardContent className="p-0 relative">
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
                        <div className="flex gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          <ProductTierBadge tier={product.tier} />
                        </div>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-600 font-bold">${product.retailPrice.toFixed(2)}</span>
                          <span className="text-sm text-gray-600 flex items-center">
                            <Star size={14} className="text-yellow-500 mr-1 fill-yellow-500" /> 
                            {product.rating?.toFixed(1)} ({product.reviewCount})
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
              
              {filteredProducts.length === 0 && (
                <div className="col-span-3 p-12 text-center">
                  <p className="text-lg text-gray-500">
                    No products match your current filters.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('');
                      setTierFilter('');
                      setModelFilter('');
                      setEngineFilter('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </Grid>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ManufacturerPage;
