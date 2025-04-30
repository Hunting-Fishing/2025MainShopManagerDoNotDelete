
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/shopping';
import { useToolCategories } from '@/hooks/useToolCategories';
import { useCategories } from '@/hooks/useCategories';
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
  const { toolCategories, isLoading: isLoadingToolCategories } = useToolCategories();
  const { products: allProducts, isLoading: isLoadingProducts } = useProducts();
  const { fetchCategoryBySlug } = useCategories();
  
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Helper function to normalize text for comparison
  const normalizeText = (text: string = '') => {
    return text.toLowerCase().replace(/[\s-_]+/g, '-').trim();
  };
  
  const findCategoryBySlug = useCallback((searchSlug: string, categories: any[]) => {
    if (!searchSlug || !categories?.length) return null;
    
    // Normalize the search slug
    const normalizedSearchSlug = normalizeText(searchSlug);
    
    console.log('Finding category with normalized slug:', normalizedSearchSlug);
    console.log('Available categories:', categories.map(c => ({
      category: c.category,
      normalizedName: normalizeText(c.category)
    })));
    
    // Find by exact match first
    let foundCategory = categories.find(
      cat => normalizeText(cat.category) === normalizedSearchSlug
    );
    
    // If not found, try more flexible matching
    if (!foundCategory) {
      foundCategory = categories.find(cat => {
        const normalizedCat = normalizeText(cat.category);
        return normalizedCat.includes(normalizedSearchSlug) || 
               normalizedSearchSlug.includes(normalizedCat);
      });
    }
    
    if (foundCategory) {
      console.log('Found matching category:', foundCategory);
    }
    
    return foundCategory;
  }, []);
  
  // Load category data when toolCategories are available
  useEffect(() => {
    const loadCategory = async () => {
      if (!slug) {
        setError("No category specified");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log('CategoryDetail: Looking for category with slug:', slug);
        
        // Format slug for display as fallback
        const formattedTitle = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Try to find the category from the database first
        const dbCategory = await fetchCategoryBySlug(slug);
        
        if (dbCategory) {
          console.log('CategoryDetail: Found category in database:', dbCategory);
          
          setCategory({
            title: dbCategory.name,
            description: dbCategory.description || `Browse our selection of ${dbCategory.name}`,
            items: [], // We may need to fetch items separately
            isNew: false,
            isPopular: false
          });
          
          setError(null);
          setIsLoading(false);
          return;
        }
        
        // If not in database, check tool categories
        if (toolCategories?.length) {
          // Find matching category
          const matchedCategory = findCategoryBySlug(slug, toolCategories);
          
          if (matchedCategory) {
            console.log('CategoryDetail: Category found in tool categories:', matchedCategory);
            
            setCategory({
              title: matchedCategory.category,
              description: matchedCategory.description || `Browse our selection of ${matchedCategory.category}`,
              items: matchedCategory.items || [],
              isNew: matchedCategory.isNew || false,
              isPopular: matchedCategory.isPopular || false
            });
            
            setError(null);
            setIsLoading(false);
            return;
          }
        }
        
        // If we get here, no category was found
        console.log(`CategoryDetail: Category not found for slug: ${slug}, using formatted title`);
        
        // Create a fallback category based on the slug
        const fixedNormalizedSlug = normalizeText(slug);
        // Special handling for common tool categories
        if (fixedNormalizedSlug.includes('hand-tool')) {
          setCategory({
            title: "Hand Tools",
            description: "Browse our selection of professional hand tools for your workshop",
            items: ["Hammers", "Screwdrivers", "Wrenches", "Pliers", "Measuring Tools"],
            isNew: false,
            isPopular: true
          });
        } else if (fixedNormalizedSlug.includes('power-tool')) {
          setCategory({
            title: "Power Tools",
            description: "Professional power tools for every job",
            items: ["Drills", "Saws", "Sanders", "Grinders", "Impact Drivers"],
            isNew: true, 
            isPopular: true
          });
        } else {
          // Generic fallback
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
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategory();
  }, [slug, toolCategories, findCategoryBySlug, fetchCategoryBySlug]);
  
  // Filter products for this category when both category and products are loaded
  useEffect(() => {
    if (!category || !allProducts?.length) {
      return;
    }
    
    try {
      console.log(`CategoryDetail: Filtering products for category: ${category.title}`);
      const categoryLower = category.title.toLowerCase();
      const categoryWords = categoryLower.split(' ');
      const slug = normalizeText(category.title);
      
      const filtered = allProducts.filter(product => {
        // Try to parse metadata if it exists
        let metadata = {};
        if (product.metadata && typeof product.metadata === 'string') {
          try {
            metadata = JSON.parse(product.metadata);
          } catch (e) {
            console.warn(`CategoryDetail: Failed to parse metadata for product ${product.id}`);
          }
        }
        
        const titleLower = product.title ? product.title.toLowerCase() : '';
        // Check if title contains the category name or any of the category words
        const hasMatchingTitle = titleLower.includes(categoryLower) || 
                                categoryWords.some(word => word.length > 3 && titleLower.includes(word));
        
        // Check for category in metadata
        const hasMatchingCategory = 
          metadata && 
          typeof metadata === 'object' && 
          'category' in metadata && 
          ((typeof metadata.category === 'string' && 
            metadata.category.toLowerCase() === categoryLower) ||
           (Array.isArray(metadata.category) && 
            metadata.category.some((cat: string) => cat.toLowerCase() === categoryLower)));
        
        // Also check for category name in description
        const hasMatchingDescription = 
          product.description && 
          typeof product.description === 'string' && 
          (product.description.toLowerCase().includes(categoryLower) ||
           categoryWords.some(word => word.length > 3 && 
                             product.description!.toLowerCase().includes(word)));
        
        // Check if product category_id matches this category
        const hasMatchingCategoryId = 
          product.category_id && 
          normalizeText(product.category_id) === slug;
        
        return hasMatchingTitle || hasMatchingCategory || hasMatchingDescription || hasMatchingCategoryId;
      });
      
      console.log(`CategoryDetail: Found ${filtered.length} products for ${category.title}`);
      setFilteredProducts(filtered);
      
      // If we got no products but this is a known category, show some example products
      if (filtered.length === 0 && (slug.includes('hand-tool') || slug.includes('power-tool'))) {
        const exampleProducts = allProducts.slice(0, 8).map(product => ({
          ...product,
          category_id: slug
        }));
        setFilteredProducts(exampleProducts);
        console.log(`CategoryDetail: Using ${exampleProducts.length} example products as fallback`);
      }
    } catch (err) {
      console.error("CategoryDetail: Error filtering products:", err);
      
      toast({
        title: "Error",
        description: "There was a problem filtering products for this category.",
        variant: "destructive",
      });
    }
  }, [category, allProducts]);
  
  // Show true loading state only when categories or products are still loading
  const showLoader = isLoading || isLoadingToolCategories || isLoadingProducts;

  // Show error state content
  if (error && !showLoader) {
    return (
      <ShoppingPageLayout
        title="Category Error"
        description="We encountered a problem loading this category"
        error={error}
      >
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">Error Loading Category</h2>
          <p className="text-muted-foreground text-center">
            {error || "An unexpected error occurred while loading this category"}
          </p>
        </div>
      </ShoppingPageLayout>
    );
  }

  // Show loading state
  if (showLoader) {
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

  // Empty state when no category found
  if (!category) {
    return (
      <ShoppingPageLayout
        title="Category Not Found"
        description="We couldn't find the requested category"
      >
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">Category Not Found</h2>
          <p className="text-muted-foreground text-center">
            The category you're looking for doesn't exist or has been moved
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
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shopping' },
        { label: 'Categories', path: '/shopping/categories' },
        { label: category.title }
      ]}
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
