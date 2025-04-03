
import React, { useState, useEffect } from 'react';
import { getCategories } from '@/services/shopping/categoryService';
import { getProducts } from '@/services/shopping/productService';
import { ProductCategory, Product, ProductFilterOptions } from '@/types/shopping';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Shopping() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<ProductFilterOptions>({});

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
      const newOptions = { ...filterOptions, categoryId: categoryId || undefined };
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shopping Quick Links</h1>
        <p className="text-muted-foreground">
          Browse our recommended products and affiliate links
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Simple category tabs */}
      <div className="flex flex-wrap gap-2 pb-4">
        <button
          className={`px-4 py-2 rounded-full ${selectedCategory === '' ? 
            'bg-primary text-primary-foreground' : 
            'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          onClick={() => handleCategoryChange('')}
          disabled={loading}
        >
          All
        </button>
        
        {categories.length > 0 ? (
          categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full ${selectedCategory === category.id ? 
                'bg-primary text-primary-foreground' : 
                'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              onClick={() => handleCategoryChange(category.id)}
              disabled={loading}
            >
              {category.name}
            </button>
          ))
        ) : !loading && (
          <div className="text-muted-foreground py-2">
            No categories available
          </div>
        )}
      </div>
      
      {/* Products grid with loading state */}
      <ProductGrid 
        products={products} 
        isLoading={loading}
        emptyMessage="No products found. Please try a different category or check back later."
      />
    </div>
  );
}
