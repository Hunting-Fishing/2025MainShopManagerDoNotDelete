
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductCategory, Product } from '@/types/shopping';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import { slugify, normalizeSlug } from '@/utils/slugUtils';

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { categories, fetchCategoryBySlug, isLoading: categoriesLoading } = useCategories();
  const { products, isLoading: productsLoading, filterOptions, updateFilters } = useProducts();
  
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarCategories, setSimilarCategories] = useState<ProductCategory[]>([]);
  const [retries, setRetries] = useState(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when the slug changes
    setIsLoading(true);
    setError(null);
    setCategory(null);
    setSimilarCategories([]);
    setDiagnosticInfo(null);
    
    // If no slug is provided, show an error
    if (!slug) {
      setError("No category specified");
      setIsLoading(false);
      return;
    }
    
    const fetchCategory = async () => {
      try {
        console.log(`Fetching category for slug: ${slug}`);
        
        // Try to normalize the slug (remove or standardize special characters)
        const normalizedSlug = normalizeSlug(slug);
        console.log(`Normalized slug: ${normalizedSlug}`);
        console.log(`Available categories:`, categories.map(c => ({id: c.id, name: c.name, slug: c.slug})));
        
        // First, try to find the category by normalized slug
        let categoryData = await fetchCategoryBySlug(normalizedSlug);
        
        // If we couldn't find it, try with the original slug
        if (!categoryData && normalizedSlug !== slug) {
          console.log(`Trying with original slug: ${slug}`);
          categoryData = await fetchCategoryBySlug(slug);
        }
        
        // If we found a category, use it
        if (categoryData) {
          console.log("Category found:", categoryData);
          setCategory(categoryData);
          updateFilters({ categoryId: categoryData.id });
        } else {
          // If not found, find similar categories for suggestions
          const slugParts = slug.split('-');
          
          // Look for categories that match any part of the slug
          const similar = categories.filter(cat => {
            if (!cat.slug) return false;
            return slugParts.some(part => 
              cat.slug.includes(part) && part.length > 2
            );
          });
          
          console.log(`No category found for slug "${slug}", found ${similar.length} similar categories`);
          setSimilarCategories(similar);
          
          // If we have similar categories, suggest them
          if (similar.length > 0) {
            setError(`Category "${slug}" not found. Did you mean one of these?`);
          } else {
            setError(`Category "${slug}" not found.`);
          }
          
          // Add diagnostic information
          setDiagnosticInfo(`
            We couldn't find a category with the slug "${slug}". 
            ${categories.length > 0 
              ? `There are ${categories.length} categories in the database.` 
              : "There are no categories in the database yet."}
          `);
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError(err instanceof Error ? err.message : "Failed to load category");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [slug, fetchCategoryBySlug, categories, updateFilters, retries]);

  // If the page is still loading, show a loading message
  if (isLoading || categoriesLoading) {
    return (
      <ShoppingPageLayout
        title="Loading Category..."
        description="Please wait while we fetch the category details"
      >
        <div className="w-full h-64 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading category details...</p>
          </div>
        </div>
      </ShoppingPageLayout>
    );
  }

  // If there's an error, show it
  if (error) {
    return (
      <ShoppingPageLayout
        title="Category Not Found"
        error={error}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Shop', path: '/shopping' },
          { label: 'Categories', path: '/shopping/categories' },
          { label: slug || 'Unknown' }
        ]}
      >
        <div className="space-y-8">
          {/* Add diagnostic information */}
          {diagnosticInfo && (
            <Alert className="bg-blue-50 border-blue-200 mb-6">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-800">Diagnostic Information</AlertTitle>
              <AlertDescription className="text-blue-700 whitespace-pre-line">
                {diagnosticInfo}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Show similar category suggestions if available */}
          {similarCategories.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Similar Categories:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarCategories.map(cat => (
                  <Button 
                    key={cat.id} 
                    variant="outline" 
                    className="h-auto py-4 justify-start text-left"
                    onClick={() => navigate(`/shopping/categories/${cat.slug}`)}
                  >
                    <div>
                      <div className="font-medium">{cat.name}</div>
                      {cat.description && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {cat.description}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Button 
              onClick={() => setRetries(r => r + 1)} 
              className="flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw size={18} className="mr-1" />
              Retry Loading Category
            </Button>
            
            <Button 
              onClick={() => navigate('/shopping/categories')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} className="mr-1" />
              Browse All Categories
            </Button>
          </div>
        </div>
      </ShoppingPageLayout>
    );
  }

  // Show the category details
  return (
    <ShoppingPageLayout
      title={category?.name || 'Category'}
      description={category?.description}
    >
      {/* Filter interface */}
      <div className="mb-8">
        <ProductFilters 
          filterOptions={filterOptions}
          onFilterChange={updateFilters}
        />
      </div>
      
      <Separator className="my-6" />
      
      {/* Products grid */}
      <ProductGrid 
        products={products}
        isLoading={productsLoading}
        emptyMessage={`No products found in ${category?.name || 'this category'}. ${category ? 'Try adding some products first.' : ''}`}
      />
    </ShoppingPageLayout>
  );
};

export default CategoryDetail;
