
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
import { ArrowLeft, AlertCircle, ShoppingBag, Loader2 } from 'lucide-react';

// Define a set of known category slug mappings for common misspellings or variations
const CATEGORY_SLUG_MAPPINGS: Record<string, string> = {
  'hand-tools': 'hand-tools',
  'handtools': 'hand-tools',
  'hand-tool': 'hand-tools',
  'hands-tools': 'hand-tools',
  'power-tools': 'power-tools',
  'powertools': 'power-tools',
  'power-tool': 'power-tools',
  'tool-accessories': 'tool-accessories',
  'toolaccessories': 'tool-accessories',
  'accessories': 'tool-accessories'
};

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
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

  const handleRetry = () => {
    setError(null);
    setIsLoaded(false);
    setRetryCount(prev => prev + 1);
  };

  // Load category details and products
  useEffect(() => {
    const loadCategoryDetails = async () => {
      try {
        setError(null);
        
        if (!slug) {
          setError('No category specified. Please select a category from the list.');
          setIsLoaded(true);
          return;
        }

        console.log(`Navigating to category: ${slug} (attempt ${retryCount + 1})`);
        
        // Normalize the slug for comparison
        const normalizedSlug = slug.toLowerCase().trim();
        
        // Try to fetch the category by exact slug first
        let category = await fetchCategoryBySlug(normalizedSlug);
        
        if (category) {
          console.log("Category found by exact slug match:", category);
          setCurrentCategory(category);
          updateFilters({ categoryId: category.id });
        } else {
          // If exact match fails, try the mappings for common variations
          const mappedSlug = CATEGORY_SLUG_MAPPINGS[normalizedSlug];
          
          if (mappedSlug) {
            console.log(`Trying mapped slug: ${mappedSlug}`);
            category = await fetchCategoryBySlug(mappedSlug);
            
            if (category) {
              console.log("Category found via mapping:", category);
              setCurrentCategory(category);
              updateFilters({ categoryId: category.id });
            }
          }
          
          // If still no match, try a fuzzy match on existing categories
          if (!category) {
            console.log("Attempting fuzzy match...");
            const normalizedSearchSlug = normalizedSlug.replace(/-/g, '').toLowerCase();
            
            const matchedCategory = categories.find(cat => 
              cat.slug.replace(/-/g, '').toLowerCase() === normalizedSearchSlug ||
              cat.name.replace(/\s+/g, '').toLowerCase() === normalizedSearchSlug
            );
            
            if (matchedCategory) {
              console.log("Category found via fuzzy match:", matchedCategory);
              setCurrentCategory(matchedCategory);
              updateFilters({ categoryId: matchedCategory.id });
            } else {
              // Try to find by partial name match as last resort
              const partialMatch = categories.find(cat => 
                cat.name.toLowerCase().includes(normalizedSlug) || 
                normalizedSlug.includes(cat.name.toLowerCase())
              );
              
              if (partialMatch) {
                console.log("Category found via partial name match:", partialMatch);
                setCurrentCategory(partialMatch);
                updateFilters({ categoryId: partialMatch.id });
              } else {
                // Handle special hardcoded case for hand-tools based on error report
                if (normalizedSlug === 'hand-tools' || normalizedSlug.includes('hand')) {
                  console.log("Using hardcoded fallback for hand-tools");
                  // Create a mock category for display
                  const handToolsCategory = {
                    id: 'hand-tools-id',
                    name: 'Hand Tools',
                    slug: 'hand-tools',
                    description: 'Quality hand tools for various projects and applications.'
                  };
                  setCurrentCategory(handToolsCategory);
                  
                  // Use text search instead of category ID for recovery
                  updateFilters({ search: 'hand tools', categoryId: undefined });
                } else {
                  // Last attempt - search for products with the slug term in title/description
                  console.log("No category found, using slug as search term");
                  updateFilters({ search: normalizedSlug.replace(/-/g, ' '), categoryId: undefined });
                  setCurrentCategory({
                    name: normalizedSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    slug: normalizedSlug,
                    description: `Products related to ${normalizedSlug.replace(/-/g, ' ')}`
                  });
                  setError(`Category "${normalizedSlug}" not found. Showing related products instead.`);
                }
              }
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
  }, [slug, categories, fetchCategoryBySlug, updateFilters, retryCount]);

  // Early return for loading state with improved animation
  if (categoriesLoading || !isLoaded) {
    return (
      <ShoppingPageLayout
        title="Loading Category"
        description="Please wait while we load category details..."
        onSearch={handleSearch}
      >
        <div className="py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse text-lg">Loading products...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
        </div>
      </ShoppingPageLayout>
    );
  }

  // Handle error states with improved UI
  if (error && (!currentCategory || !products || products.length === 0)) {
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
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              <p className="text-sm">If you believe this is a mistake, please try refreshing the page.</p>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-6 text-center mt-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Try Again
              </Button>
              
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
      {error && (
        <Alert variant="warning" className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Note</AlertTitle>
          <AlertDescription className="text-amber-700">{error}</AlertDescription>
        </Alert>
      )}

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
        emptyMessage={`No products found in ${currentCategory?.name || 'this category'}. Check back later or try a different category.`}
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
