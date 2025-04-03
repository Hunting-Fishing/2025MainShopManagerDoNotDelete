
import React, { useState, useEffect } from 'react';
import { getCategories } from '@/services/shopping/categoryService';
import { getProducts } from '@/services/shopping/productService';
import { ProductCategory, Product, ProductFilterOptions } from '@/types/shopping';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { HierarchicalCategoryMenu } from '@/components/shopping/HierarchicalCategoryMenu';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search } from "lucide-react";
import { Input } from '@/components/ui/input';

export default function Shopping() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<ProductFilterOptions>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching categories...");
        // Load categories
        const categoriesData = await getCategories();
        console.log("Categories fetched:", categoriesData);
        setCategories(categoriesData);
        
        // Load initial products
        console.log("Fetching products...");
        const productsData = await getProducts();
        console.log("Products fetched:", productsData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading shopping data:", error);
        setError("Failed to load shopping data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    setError(null);
    
    try {
      const newOptions = { 
        ...filterOptions, 
        categoryId: categoryId || undefined,
        search: searchQuery || undefined 
      };
      setFilterOptions(newOptions);
      const filteredProducts = await getProducts(newOptions);
      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error filtering products:", error);
      setError("Failed to filter products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const newOptions = { 
        ...filterOptions, 
        search: searchQuery || undefined 
      };
      setFilterOptions(newOptions);
      const searchResults = await getProducts(newOptions);
      setProducts(searchResults);
    } catch (error) {
      console.error("Error searching products:", error);
      setError("Failed to search products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Shopping Quick Links</h1>
        <p className="text-muted-foreground">
          Browse our recommended products and affiliate links for your automotive needs
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="sticky top-4 p-4 border rounded-lg bg-background shadow-sm">
            <h2 className="font-medium mb-3">Categories</h2>
            <HierarchicalCategoryMenu 
              categories={categories}
              selectedCategoryId={selectedCategory}
              onCategoryChange={handleCategoryChange}
              isLoading={loading && categories.length === 0}
            />
          </div>
        </div>
        
        <div className="md:col-span-3">
          <ProductGrid 
            products={products} 
            isLoading={loading}
            emptyMessage="No products found. Please try a different category or check back later."
          />
        </div>
      </div>
    </div>
  );
}
