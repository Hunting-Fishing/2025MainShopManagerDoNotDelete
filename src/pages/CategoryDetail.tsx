
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/shopping';
import { useCategories } from '@/hooks/useCategories';

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toolCategories } = useToolCategories();
  const { products, isLoading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [categoryDescription, setDescription] = useState('');

  // Find category from URL slug
  useEffect(() => {
    if (slug && toolCategories) {
      // Convert slug like "power-tools" to "Power Tools" for display
      const formattedTitle = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const category = toolCategories.find(
        cat => cat.category.toLowerCase().replace(/\s+/g, '-') === slug
      );
      
      setCategoryTitle(category?.category || formattedTitle);
      setDescription(category?.description || '');
    }
  }, [slug, toolCategories]);

  // Filter products for this category
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      // In a real app, we'd filter by category from the database
      // For now we just return products as a placeholder
      setFilteredProducts(products);
    }
  }, [products, isLoading, slug]);

  return (
    <ShoppingPageLayout
      title={categoryTitle}
      description={categoryDescription || `Browse our selection of ${categoryTitle}`}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{categoryTitle}</h1>
        <p className="text-muted-foreground">{categoryDescription}</p>
        
        {/* Category specific header content could go here */}
      </div>

      <ProductGrid 
        products={filteredProducts}
        isLoading={isLoading} 
        emptyMessage={`No products found in the ${categoryTitle} category.`}
      />
    </ShoppingPageLayout>
  );
};

// Import the hook here to avoid circular dependencies
import { useToolCategories } from '@/hooks/useToolCategories';

export default CategoryDetail;
