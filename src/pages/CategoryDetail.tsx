
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { ProductFilterOptions } from '@/types/shopping';
import { handleApiError } from '@/utils/errorHandling';
import { ArrowLeft, AlertCircle, ShoppingBag } from 'lucide-react';

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { categories, isLoading: categoriesLoading, fetchCategoryBySlug } = useCategories();
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [filterOptions, setFilterOptions] = useState<ProductFilterOptions>({
    categoryId: undefined,
    sortBy: 'popularity'
  });

  const { 
    products, 
    isLoading: productsLoading, 
    error: productsError,
    updateFilters
  } = useProducts(filterOptions);

  // Handle search functionality
  const handleSearch = (term: string) => {
    updateFilters({ search: term });
  };

  // Load category details and products
  useEffect(() => {
    const loadCategoryDetails = async () => {
      try {
        setError(null);
        
        if (!slug) {
          setError('No category specified. Please select a category.');
          setIsLoaded(true);
          return;
        }

        console.log('Navigating to category:', slug);
        
        // Try to fetch the category by slug
        const category = await fetchCategoryBySlug(slug);
        
        if (category) {
          setCurrentCategory(category);
          updateFilters({ categoryId: category.id });
        } else {
          // If category not found by exact slug, try a fuzzy match
          const normalizedSlug = slug.toLowerCase().replace(/-/g, '');
          const matchedCategory = categories.find(cat => 
            cat.slug.toLowerCase().replace(/-/g, '') === normalizedSlug
          );
          
          if (matchedCategory) {
            setCurrentCategory(matchedCategory);
            updateFilters({ categoryId: matchedCategory.id });
          } else {
            // Handle common categories as fallbacks
            const hardcodedFallbacks: {[key: string]: string} = {
              'powertools': 'power-tools',
              'handtools': 'hand-tools'
            };
            
            if (hardcodedFallbacks[normalizedSlug]) {
              const fallbackCategory = await fetchCategoryBySlug(hardcodedFallbacks[normalizedSlug]);
              if (fallbackCategory) {
                setCurrentCategory(fallbackCategory);
                updateFilters({ categoryId: fallbackCategory.id });
              } else {
                setError(`Category not found: ${slug}`);
              }
            } else {
              setError(`Category not found: ${slug}`);
            }
          }
        }
      } catch (err) {
        console.error('Error loading category:', err);
        setError(err instanceof Error ? err.message : 'Failed to load category');
        handleApiError(err, 'Error loading category details');
      } finally {
        setIsLoaded(true);
      }
    };

    loadCategoryDetails();
  }, [slug, categories, fetchCategoryBySlug, updateFilters]);

  // Early return for loading state
  if (categoriesLoading || !isLoaded) {
    return (
      <ShoppingPageLayout
        title="Loading Category"
        description="Please wait while we load category details..."
        onSearch={handleSearch}
      >
        <div className="py-12 flex justify-center">
          <div className="animate-pulse space-y-8 w-full">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ShoppingPageLayout>
    );
  }

  // Handle error states
  if (error) {
    return (
      <ShoppingPageLayout
        title="Category Not Found"
        description="We couldn't find the category you're looking for."
        error={error}
        onSearch={handleSearch}
      >
        <div className="py-8 flex flex-col items-center">
          <Alert variant="destructive" className="mb-6 max-w-lg mx-auto">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Category Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="space-y-6 text-center">
            <p>You might want to:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => navigate('/shopping/categories')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Browse All Categories
              </Button>
              
              <Button 
                onClick={() => navigate('/shopping')}
                className="flex items-center gap-2"
              >
                <ShoppingBag size={16} />
                Go To Shop Home
              </Button>
            </div>
          </div>
          
          {categories.length > 0 && (
            <div className="mt-10 w-full max-w-3xl">
              <h3 className="text-lg font-medium mb-4">Available Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.slice(0, 6).map(cat => (
                  <Button 
                    key={cat.id}
                    variant="outline" 
                    className="justify-start text-left overflow-hidden text-ellipsis whitespace-nowrap"
                    onClick={() => navigate(`/shopping/categories/${cat.slug}`)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ShoppingPageLayout>
    );
  }

  // Determine if we have products to show
  const hasProducts = products && products.length > 0;
  
  return (
    <ShoppingPageLayout
      title={currentCategory?.name || 'Category Products'}
      description={currentCategory?.description}
      onSearch={handleSearch}
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shopping' },
        { label: 'Categories', path: '/shopping/categories' },
        { label: currentCategory?.name || 'Products' }
      ]}
    >
      {productsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error Loading Products</AlertTitle>
          <AlertDescription>{productsError.message}</AlertDescription>
        </Alert>
      )}

      <ProductGrid 
        products={products} 
        isLoading={productsLoading} 
        emptyMessage={`No products found in this category. Check back later or try a different category.`}
        error={productsError?.message || null}
      />

      {!hasProducts && !productsLoading && !productsError && (
        <div className="mt-8 p-6 border border-dashed border-gray-300 rounded-lg text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium mb-2">No products in this category yet</h3>
          <p className="text-muted-foreground mb-4">
            We're working on adding more products to our catalog.
          </p>
          <Button onClick={() => navigate('/shopping')}>
            Browse All Products
          </Button>
        </div>
      )}
    </ShoppingPageLayout>
  );
};

export default CategoryDetail;
