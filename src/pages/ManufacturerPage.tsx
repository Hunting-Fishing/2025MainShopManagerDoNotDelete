
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Header, Segment } from 'semantic-ui-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Car } from 'lucide-react';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import SearchBar from '@/components/affiliate/SearchBar';

const ManufacturerPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
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
      {/* Manufacturer Header */}
      <Segment className="mt-4 mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg">
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
        
        <div className="mt-4 flex gap-4 flex-wrap">
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
        </div>
      </div>
      
      {/* Products Grid */}
      <Segment className="bg-white p-6 rounded-lg">
        <Header as="h2" className="text-2xl font-bold mb-4">
          {filteredProducts.length > 0 ? `${manufacturer.name} Compatible Tools (${filteredProducts.length})` : 'No tools found'}
        </Header>
        
        {filteredProducts.length > 0 ? (
          <ResponsiveGrid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap="md" className="mt-6">
            {filteredProducts.map(product => (
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
