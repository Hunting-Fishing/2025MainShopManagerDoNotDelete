
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Header, Segment } from 'semantic-ui-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { manufacturers, generateManufacturerProducts } from '@/data/manufacturers';
import { AffiliateProduct, Manufacturer } from '@/types/affiliate';
import { Car, Grid3X3, Home, List, ChevronRight, ArrowUpDown } from 'lucide-react';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import SearchBar from '@/components/affiliate/SearchBar';
import { Link } from 'react-router-dom';

// Sorting options for the dropdown
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating-desc';

const sortOptions = [
  { value: 'default', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'rating-desc', label: 'Highest Rated' }
];

const ManufacturerPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    // Find manufacturer by slug
    const foundManufacturer = manufacturers.find(m => m.slug === slug);
    if (foundManufacturer) {
      setManufacturer(foundManufacturer);
      
      // Generate products for this manufacturer
      const manufacturerProducts = generateManufacturerProducts(foundManufacturer.slug);
      setProducts(manufacturerProducts);
    }
  }, [slug]);

  // Get unique categories for the filter
  const categories = products.length > 0 
    ? ['all', ...new Set(products.map(product => product.category))]
    : ['all'];
    
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Sort the filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.retailPrice - b.retailPrice;
      case 'price-desc':
        return b.retailPrice - a.retailPrice;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'rating-desc':
        return (b.rating || 0) - (a.rating || 0);
      default:
        // Default sorting (recommended)
        // Sort by featured status first, then rating
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.rating || 0) - (a.rating || 0);
    }
  });

  if (!manufacturer) {
    return (
      <Container fluid>
        <Segment className="mt-8 text-center p-12">
          <Header as="h2">Manufacturer not found</Header>
          <p>The manufacturer you are looking for doesn't exist or has been removed.</p>
        </Segment>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4 text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              <span>Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/tools">Tools</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <span className="font-medium">{manufacturer.name}</span>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Manufacturer Header */}
      <Segment className="mt-2 mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm relative">
            {manufacturer.logoUrl && (
              <img 
                src={manufacturer.logoUrl} 
                alt={manufacturer.name} 
                className="max-h-16 max-w-16 object-contain z-10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-blue-100 z-0">
              <Car size={36} className="text-blue-600" />
            </div>
          </div>
          <div>
            <Header as="h1" className="text-3xl font-bold mb-2 text-white">
              {manufacturer.name} Tools
            </Header>
            <p className="text-lg opacity-90">
              Professional diagnostic and repair tools compatible with {manufacturer.name} vehicles
            </p>
          </div>
        </div>
      </Segment>
      
      {/* Search and Filters */}
      <div className="mb-6">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <div className="mt-4 flex gap-4 flex-wrap items-center justify-between">
          <div className="flex gap-4 flex-wrap">
            <div className="w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sort By</SelectLabel>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid3X3 className="w-4 h-4 mr-1" /> Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="w-4 h-4 mr-1" /> List
            </Button>
          </div>
        </div>
      </div>
      
      {/* Products Grid or List */}
      <Segment className="bg-white p-6 rounded-lg">
        <Header as="h2" className="text-2xl font-bold mb-4 flex justify-between items-center">
          <div>
            {sortedProducts.length > 0 ? 
              `${manufacturer.name} Compatible Tools (${sortedProducts.length})` : 
              'No tools found'
            }
          </div>
        </Header>
        
        {sortedProducts.length > 0 ? (
          viewMode === 'grid' ? (
            <ResponsiveGrid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap="md" className="mt-6">
              {sortedProducts.map(product => (
                <Card key={product.id} className="h-full hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="aspect-video mb-3 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://via.placeholder.com/300x200?text=${product.name}`;
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {product.category}
                      </span>
                      <h3 className="font-bold text-base line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <div className="flex items-baseline justify-between mt-2">
                        <div className="font-bold text-lg">
                          ${product.retailPrice.toFixed(2)}
                          {product.discount && (
                            <span className="ml-2 text-sm text-green-600 font-normal">
                              {product.discount}% off
                            </span>
                          )}
                        </div>
                      </div>
                      <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          ) : (
            <div className="space-y-4 mt-6">
              {sortedProducts.map(product => (
                <Card key={product.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="shrink-0 md:w-1/4 lg:w-1/6">
                        <div className="aspect-video md:aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = `https://via.placeholder.com/300x200?text=${product.name}`;
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-grow flex flex-col">
                        <div className="flex flex-col md:flex-row justify-between gap-2 mb-2">
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200 mb-2">
                              {product.category}
                            </span>
                            <h3 className="font-bold text-lg">{product.name}</h3>
                          </div>
                          <div className="text-right font-bold text-lg">
                            ${product.retailPrice.toFixed(2)}
                            {product.discount && (
                              <span className="ml-2 text-sm text-green-600 font-normal block md:inline">
                                {product.discount}% off
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 flex-grow">{product.description}</p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-sm text-gray-500">
                            {product.manufacturer} - {product.model}
                          </div>
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <Car size={48} className="text-gray-400 mx-auto mb-3" />
            <p className="text-lg text-gray-600">No tools found matching your search criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Segment>
    </Container>
  );
};

export default ManufacturerPage;
