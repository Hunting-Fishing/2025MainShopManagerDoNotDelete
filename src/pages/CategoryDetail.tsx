
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/shopping';
import { useToolCategories } from '@/hooks/useToolCategories';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

interface CategoryData {
  title: string;
  description: string;
  items: string[];
  isNew: boolean;
  isPopular: boolean;
}

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toolCategories, isLoading: isLoadingToolCategories, error: categoriesError } = useToolCategories();
  const { products, isLoading: isLoadingProducts, error: productsError } = useProducts();
  
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Compute derived loading state
  const isLoading = useMemo(() => {
    return isLoadingToolCategories || isLoadingProducts || !category;
  }, [isLoadingToolCategories, isLoadingProducts, category]);
  
  // Handle errors
  useEffect(() => {
    if (categoriesError) {
      console.error("CategoryDetail: Error loading tool categories:", categoriesError);
      setError("Failed to load category data. Please try again later.");
      
      toast({
        title: "Error Loading Category",
        description: "There was a problem loading the category details.",
        variant: "destructive",
      });
    } else if (productsError) {
      console.error("CategoryDetail: Error loading products:", productsError);
      
      toast({
        title: "Error Loading Products",
        description: "There was a problem loading the products for this category.",
        variant: "destructive",
      });
    } else {
      setError(null);
    }
  }, [categoriesError, productsError]);
  
  // Load category data when toolCategories are available
  useEffect(() => {
    if (!slug || isLoadingToolCategories || !toolCategories?.length) {
      return;
    }
    
    try {
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
    } catch (err) {
      console.error("CategoryDetail: Error processing category data:", err);
      setError("Error processing category data. Please try again later.");
      
      toast({
        title: "Error",
        description: "There was a problem loading the category.",
        variant: "destructive",
      });
    }
  }, [slug, toolCategories, isLoadingToolCategories]);
  
  // Filter products for this category when both category and products are loaded
  useEffect(() => {
    if (!category || !products?.length || isLoadingProducts) {
      return;
    }
    
    try {
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
          (metadata && 
           typeof metadata === 'object' && 
           'category' in metadata && 
           typeof metadata.category === 'string' &&
           metadata.category.toLowerCase() === categoryLower)
        );
      });
      
      console.log(`CategoryDetail: Found ${filtered.length} products for ${category.title}`);
      setFilteredProducts(filtered);
    } catch (err) {
      console.error("CategoryDetail: Error filtering products:", err);
      
      toast({
        title: "Error",
        description: "There was a problem filtering products for this category.",
        variant: "destructive",
      });
    }
  }, [category, products, isLoadingProducts]);
  
  // Loading state content
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

  // Error state content
  if (error || !category) {
    return (
      <ShoppingPageLayout
        title="Category Not Found"
        description="We couldn't find the requested category"
      >
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">Category Not Found</h2>
          <p className="text-muted-foreground text-center">
            {error || "The category you're looking for doesn't exist or has been moved"}
          </p>
        </div>
      </ShoppingPageLayout>
    );
  }

  // Render the category page with products
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
