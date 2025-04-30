
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/shopping';
import { useToolCategories } from '@/hooks/useToolCategories';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Define an interface for the product metadata
interface ProductMetadata {
  category?: string;
  [key: string]: any;
}

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toolCategories } = useToolCategories();
  const { products, isLoading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [categoryDescription, setDescription] = useState('');
  const [categoryItems, setCategoryItems] = useState<string[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  
  // Initialize category data from local tool categories
  useEffect(() => {
    if (!slug || !toolCategories) return;
    
    setIsLoadingCategory(true);
    
    // Convert slug like "power-tools" to "Power Tools" for display (as fallback)
    const formattedTitle = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Try to find the matching category from our local data
    const category = toolCategories.find(
      cat => cat.category.toLowerCase().replace(/\s+/g, '-') === slug
    );
    
    if (category) {
      // Set values from found category
      setCategoryTitle(category.category);
      setDescription(category.description || '');
      setCategoryItems(category.items || []);
      setIsNew(category.isNew || false);
      setIsPopular(category.isPopular || false);
      console.log("Category found:", category);
    } else {
      // Use formatted slug as fallback
      setCategoryTitle(formattedTitle);
      setDescription(`Browse our selection of ${formattedTitle}`);
      setCategoryItems([]);
      setIsNew(false);
      setIsPopular(false);
      console.warn(`Category not found for slug: ${slug}`);
    }
    
    // No longer attempting Supabase API calls as they're failing with 406 errors
    setIsLoadingCategory(false);
  }, [slug, toolCategories]);

  // Filter products for this category whenever needed data changes
  useEffect(() => {
    if (!isLoading && products.length > 0 && categoryTitle && !isLoadingCategory) {
      const categoryLower = categoryTitle.toLowerCase();
      console.log("Filtering products for category:", categoryTitle);
      
      const filtered = products.filter(product => {
        // Try to parse metadata if it exists
        let metadata: ProductMetadata = {};
        if (product.metadata) {
          try {
            metadata = JSON.parse(product.metadata) as ProductMetadata;
          } catch (e) {
            console.warn("Failed to parse metadata for product", product.id);
          }
        }
        
        const titleLower = product.title.toLowerCase();
        
        return (
          titleLower.includes(categoryLower) || 
          (metadata?.category && 
           metadata.category.toLowerCase() === categoryLower)
        );
      });
      
      console.log(`Found ${filtered.length} products for ${categoryTitle}`);
      setFilteredProducts(filtered);
    }
  }, [products, isLoading, categoryTitle, isLoadingCategory]);

  // Render loading state while category data is being loaded
  if (isLoadingCategory) {
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

  return (
    <ShoppingPageLayout
      title={categoryTitle}
      description={categoryDescription || `Browse our selection of ${categoryTitle}`}
    >
      <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold">{categoryTitle}</h1>
          {isNew && (
            <Badge className="bg-green-100 text-green-800 border border-green-300">New</Badge>
          )}
          {isPopular && (
            <Badge className="bg-amber-100 text-amber-800 border border-amber-300">Popular</Badge>
          )}
        </div>
        
        <p className="text-muted-foreground mb-6">{categoryDescription}</p>
        
        {categoryItems.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-medium mb-3">Common Items in this Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {categoryItems.map((item, index) => (
                <Card key={index} className="border-l-2 border-l-blue-500">
                  <CardContent className="p-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      <span className="text-sm">{item}</span>
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
        isLoading={isLoading || isLoadingCategory} 
        emptyMessage={`No products found in the ${categoryTitle} category.`}
      />
    </ShoppingPageLayout>
  );
};

export default CategoryDetail;
