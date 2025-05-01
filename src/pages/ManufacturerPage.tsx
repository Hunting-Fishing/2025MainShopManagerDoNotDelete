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
import { manufacturers } from '@/data/manufacturers';
import { generateManufacturerProducts } from '@/data/manufacturers/productGenerator';
import { AffiliateProduct, Manufacturer } from '@/types/affiliate';
import { Car, Grid3X3, Home, List, ChevronRight, ArrowUpDown } from 'lucide-react';

// Fix the interface to use a string type for the manufacturerSlug
interface ManufacturerParams {
  manufacturerSlug: string;
}

const ManufacturerPage = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "price">("name");
  const [manufacturer, setManufacturer] = useState<Manufacturer | undefined>(undefined);
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  
  // Use the correct type with React Router's useParams
  const { manufacturerSlug } = useParams<Record<string, string>>();

  useEffect(() => {
    if (manufacturerSlug) {
      const foundManufacturer = manufacturers.find(m => m.slug === manufacturerSlug);
      if (foundManufacturer) {
        setManufacturer(foundManufacturer);
        setProducts(generateManufacturerProducts(foundManufacturer.id, 12));
      } else {
        setManufacturer(undefined);
        setProducts([]);
      }
    }
  }, [manufacturerSlug]);

  if (!manufacturer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Manufacturer Not Found</h1>
          <Link to="/manufacturers" className="text-blue-600 hover:text-blue-800">
            Back to Manufacturers
          </Link>
        </div>
        <p>The requested manufacturer was not found.</p>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "rating") {
      return b.rating - a.rating;
    } else if (sortBy === "price") {
      return a.retailPrice - b.retailPrice;
    }
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link to="/manufacturers" className="text-blue-600 hover:text-blue-800 flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Back to Manufacturers
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
        <Select onValueChange={value => setSortBy(value as "name" | "rating" | "price")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedProducts.map(product => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover mb-2" />
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-gray-500 text-xs">{product.description.substring(0, 50)}...</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-600 font-bold">${product.retailPrice}</span>
                  <Badge variant="outline">{product.tier}</Badge>
                </div>
                <Link to={product.affiliateUrl} className="text-blue-600 hover:text-blue-800 text-xs">
                  View Product <ChevronRight className="inline-block h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {sortedProducts.map(product => (
            <div key={product.id} className="py-4 flex items-center">
              <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover mr-4" />
              <div>
                <h3 className="text-lg font-medium">{product.name}</h3>
                <p className="text-gray-500">{product.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-blue-600 font-bold">${product.retailPrice}</span>
                  <Badge variant="outline">{product.tier}</Badge>
                  <Link to={product.affiliateUrl} className="text-blue-600 hover:text-blue-800">
                    View Product <ChevronRight className="inline-block h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManufacturerPage;
