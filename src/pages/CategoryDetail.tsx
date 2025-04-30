
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/shopping';
import { useToolCategories } from '@/hooks/useToolCategories';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toolCategories, isLoading: isLoadingToolCategories } = useToolCategories();
  const { products, isLoading: isLoadingProducts } = useProducts();
  
  const [category, setCategory] = useState<{
    title: string;
    description: string;
    items: string[];
    isNew: boolean;
    isPopular: boolean;
  } | null>(null);
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load category data
  useEffect(() => {
    console.log(`CategoryDetail: Loading category data for slug: ${slug}`);
    
    if (!slug || !toolCategories || isLoadingToolCategories) {
      console.log('CategoryDetail: Still waiting for toolCategories data...');
      return;
    }
    
    // Format slug for display as fallback
    const formattedTitle = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Find matching category
    const matchedCategory = toolCategories.find(
      cat => cat.category.toLowerCase().replace(/\s+/g, '-') === slug
    );
    
    if (matchedCategory) {
      console.log('CategoryDetail: Category found:', matchedCategory);
      
      setCategory({
        title: matchedCategory.category,
        description: matchedCategory.description || `Browse our selection of ${matchedCategory.category}`,
        items: matchedCategory.items || [],
        isNew: matchedCategory.isNew || false,
        isPopular: matchedCategory.isPopular || false
      });
    } else {
      console.log(`CategoryDetail: Category not found for slug: ${slug}, using formatted title`);
      
      setCategory({
        title: formattedTitle,
        description: `Browse our selection of ${formattedTitle}`,
        items: [],
        isNew: false,
        isPopular: false
      });
    }
  }, [slug, toolCategories, isLoadingToolCategories]);
  
  // Filter products for this category
  useEffect(() => {
    if (!category || !products.length || isLoadingProducts) {
      console.log('CategoryDetail: Waiting for category data or products to filter...');
      return;
    }
    
    console.log(`CategoryDetail: Filtering products for category: ${category.title}`);
    const categoryLower = category.title.toLowerCase();
    
    const filtered = products.filter(product => {
      // Try to parse metadata if it exists
      let metadata = {};
      if (product.metadata) {
        try {
          metadata = JSON.parse(product.metadata);
        } catch (e) {
          console.warn(`CategoryDetail: Failed to parse metadata for product ${product.id}`);
        }
      }
      
      const titleLower = product.title.toLowerCase();
      
      return (
        titleLower.includes(categoryLower) || 
        (metadata && metadata.category && 
         metadata.category.toLowerCase() === categoryLower)
      );
    });
    
    console.log(`CategoryDetail: Found ${filtered.length} products for ${category.title}`);
    setFilteredProducts(filtered);
  }, [category, products, isLoadingProducts]);
  
  // Track overall loading state
  useEffect(() => {
    const loading = isLoadingToolCategories || isLoadingProducts || !category;
    console.log(`CategoryDetail: Setting loading state to ${loading}`);
    setIsLoading(loading);
  }, [isLoadingToolCategories, isLoadingProducts, category]);
  
  if (isLoading) {
    return (
      <ShoppingPageLayout 
        title="Loading Category"
        description="Please wait while we load the category details"
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </ShoppingPageLayout>
    );
  }

  if (!category) {
    return (
      <ShoppingPageLayout
        title="Category Not Found"
        description="We couldn't find the requested category"
      >
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-medium mb-2">Category Not Found</h2>
          <p className="text-muted-foreground">The category you're looking for doesn't exist or has been moved</p>
        </div>
      </ShoppingPageLayout>
    );
  }

  return (
    <ShoppingPageLayout
      title={category.title}
      description={category.description}
    >
      <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold">{category.title}</h1>
          {category.isNew && (
            <Badge className="bg-green-100 text-green-800 border border-green-300 font-medium">New</Badge>
          )}
          {category.isPopular && (
            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-medium">Popular</Badge>
          )}
        </div>
        
        <p className="text-muted-foreground mb-6">{category.description}</p>
        
        {category.items && category.items.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-medium mb-3">Common Items in this Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {category.items.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProductGrid 
        products={filteredProducts}
        isLoading={false} 
        emptyMessage={`No products found in the ${category.title} category.`}
      />
    </ShoppingPageLayout>
  );
};

export default CategoryDetail;
