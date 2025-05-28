
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Car, Grid3X3, Home, List, ChevronRight } from 'lucide-react';

interface Manufacturer {
  id: string;
  name: string;
  category: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  manufacturer: string;
  image_url?: string;
  featured: boolean;
}

const ManufacturerPage = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price">("name");
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { manufacturerSlug } = useParams<Record<string, string>>();

  useEffect(() => {
    fetchManufacturerAndProducts();
  }, [manufacturerSlug]);

  const fetchManufacturerAndProducts = async () => {
    if (!manufacturerSlug) return;
    
    setLoading(true);
    try {
      // Fetch manufacturer by slug
      const { data: manufacturerData, error: manufacturerError } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('slug', manufacturerSlug)
        .single();

      if (manufacturerError || !manufacturerData) {
        setManufacturer(null);
        setProducts([]);
        return;
      }

      setManufacturer(manufacturerData);

      // Fetch products for this manufacturer
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('manufacturer_id', manufacturerData.id);

      if (!productsError && productsData) {
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching manufacturer data:', error);
      setManufacturer(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!manufacturer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Manufacturer Not Found</h1>
          <Link to="/tools" className="text-blue-600 hover:text-blue-800">
            Back to Tools Shop
          </Link>
        </div>
        <p>The requested manufacturer was not found.</p>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "price") {
      return a.price - b.price;
    }
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link to="/tools" className="text-blue-600 hover:text-blue-800 flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Back to Tools Shop
          </Link>
          <h1 className="text-2xl font-bold">{manufacturer.name}</h1>
          <Badge variant="secondary">{manufacturer.category}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setView("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setView("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Select onValueChange={value => setSortBy(value as "name" | "price")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found for this manufacturer.</p>
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedProducts.map(product => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover mb-2" />
                    )}
                    <h3 className="text-sm font-medium">{product.name}</h3>
                    <p className="text-gray-500 text-xs">{product.description?.substring(0, 50)}...</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-blue-600 font-bold">${product.price.toFixed(2)}</span>
                      {product.featured && <Badge variant="outline">Featured</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedProducts.map(product => (
                <div key={product.id} className="py-4 flex items-center">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover mr-4" />
                  )}
                  <div>
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-gray-500">{product.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-blue-600 font-bold">${product.price.toFixed(2)}</span>
                      {product.featured && <Badge variant="outline">Featured</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManufacturerPage;
