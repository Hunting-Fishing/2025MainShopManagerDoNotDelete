
import React, { useState } from 'react';
import { SeoHead } from '@/components/common/SeoHead';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  description: string;
  inStock: boolean;
  rating: number;
  manufacturer: string;
}

// Sample product data
const products: Product[] = [
  {
    id: '1',
    name: 'Premium Diagnostic Scanner',
    category: 'Tools',
    price: 499.99,
    imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200',
    description: 'Professional-grade OBD-II scanner with advanced diagnostics',
    inStock: true,
    rating: 4.8,
    manufacturer: 'TechPro'
  },
  {
    id: '2',
    name: 'Heavy-Duty Floor Jack',
    category: 'Equipment',
    price: 249.99,
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=200',
    description: '3-ton capacity hydraulic floor jack for automotive use',
    inStock: true,
    rating: 4.5,
    manufacturer: 'LiftMaster'
  },
  {
    id: '3',
    name: 'Premium Oil Filter',
    category: 'Parts',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=300&h=200',
    description: 'High-quality oil filter for most vehicle makes and models',
    inStock: true,
    rating: 4.2,
    manufacturer: 'FilterPro'
  },
  {
    id: '4',
    name: 'Brake Cleaner Spray',
    category: 'Supplies',
    price: 8.99,
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=300&h=200',
    description: 'Professional-grade brake cleaner and degreaser',
    inStock: false,
    rating: 4.7,
    manufacturer: 'CleanTech'
  },
  {
    id: '5',
    name: 'Digital Tire Pressure Gauge',
    category: 'Tools',
    price: 24.99,
    imageUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&h=200',
    description: 'Accurate digital tire pressure gauge with LCD display',
    inStock: true,
    rating: 4.4,
    manufacturer: 'PreciseTech'
  },
  {
    id: '6',
    name: 'Shop Towels (Pack of 25)',
    category: 'Supplies',
    price: 18.99,
    description: 'Durable, absorbent shop towels for general maintenance',
    inStock: true,
    rating: 4.1,
    manufacturer: 'ShopClean'
  },
];

// Available categories
const categories = ['All', 'Tools', 'Equipment', 'Supplies', 'Parts'];

export default function Shopping() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ productId: string, quantity: number }[]>([]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add to cart handler
  const addToCart = (productId: string) => {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  // Calculate total items in cart
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Generate star rating display
  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`text-sm ${i < Math.round(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return <div className="flex">{stars} <span className="ml-1 text-xs text-gray-600">({rating})</span></div>;
  };

  return (
    <div className="space-y-6">
      <SeoHead 
        title="Shopping | Easy Shop Manager"
        description="Browse and purchase equipment, tools, and supplies for your shop."
        keywords="shop equipment, tools, supplies, shop management, purchasing"
      />
      
      {/* Header with search and cart */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Shop Equipment & Supplies</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button 
              variant="outline" 
              className="relative p-2"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Search and filter controls */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-800 p-3 shadow-sm border border-gray-200 dark:border-slate-700 rounded-xl">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search products..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button 
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`rounded-full text-sm px-4 ${
              selectedCategory === category 
                ? "bg-blue-600 text-white" 
                : "border-blue-500 text-blue-600"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      {/* Grid of products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-slate-100 dark:bg-slate-800">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Out of Stock</span>
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-purple-600">{product.category}</Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                  <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">{product.manufacturer}</span>
                    <div className="mt-1">{renderRating(product.rating)}</div>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!product.inStock}
                    onClick={() => addToCart(product.id)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            <p>No products found matching your criteria.</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
