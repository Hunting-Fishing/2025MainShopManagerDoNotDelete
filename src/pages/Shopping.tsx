
import React, { useState, useEffect } from 'react';
import { getCategories } from '@/services/shopping/categoryService';
import { getProducts } from '@/services/shopping/productService';
import { ProductCategory, Product, ProductFilterOptions } from '@/types/shopping';
import { ProductGrid } from '@/components/shopping/ProductGrid';

export default function Shopping() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<ProductFilterOptions>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Load initial products
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading shopping data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    
    try {
      const newOptions = { ...filterOptions, categoryId: categoryId || undefined };
      setFilterOptions(newOptions);
      const filteredProducts = await getProducts(newOptions);
      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error filtering products:", error);
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
      
      {/* Simple category tabs */}
      <div className="flex flex-wrap gap-2 pb-4">
        <button
          className={`px-4 py-2 rounded-full ${selectedCategory === '' ? 
            'bg-primary text-primary-foreground' : 
            'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          onClick={() => handleCategoryChange('')}
        >
          All
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-full ${selectedCategory === category.id ? 
              'bg-primary text-primary-foreground' : 
              'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
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
