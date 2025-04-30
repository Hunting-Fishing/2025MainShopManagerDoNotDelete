
import React, { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw, Wrench, Hammer, Pliers, Screwdriver } from 'lucide-react';
import { useCategoryDetail } from '@/hooks/useCategoryDetail';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { CategoryTabs } from '@/components/shopping/CategoryTabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { normalizeSlug } from '@/utils/slugUtils';

// Static product data for Hand Tools category
const handToolsProducts = [
  {
    id: "ht001",
    title: "Professional Mechanics Tool Set (145-Piece)",
    description: "Complete toolkit with ratchets, sockets, wrenches and more in a durable case",
    image_url: "https://m.media-amazon.com/images/I/71TC2uXhKWL._AC_SL1500_.jpg",
    price: 129.99,
    category_id: "hand-tools",
    product_type: "affiliate",
    is_featured: true,
    is_bestseller: true,
    is_approved: true,
    created_at: "2023-05-15T00:00:00Z",
    updated_at: "2023-05-15T00:00:00Z",
    average_rating: 4.5,
    review_count: 235
  },
  {
    id: "ht002",
    title: "Adjustable Wrench Set (4-Piece)",
    description: "Set of 4 adjustable wrenches in different sizes for versatile use",
    image_url: "https://m.media-amazon.com/images/I/71jzjuUQ9kL._AC_SL1500_.jpg",
    price: 34.99,
    category_id: "hand-tools",
    product_type: "affiliate",
    is_featured: false,
    is_bestseller: true,
    is_approved: true,
    created_at: "2023-05-20T00:00:00Z",
    updated_at: "2023-05-20T00:00:00Z",
    average_rating: 4.3,
    review_count: 128
  },
  {
    id: "ht003",
    title: "Precision Screwdriver Set for Electronics",
    description: "16-piece set for electronics repair with magnetic tips",
    image_url: "https://m.media-amazon.com/images/I/71nnUwycHDL._AC_SL1500_.jpg",
    price: 19.99,
    category_id: "hand-tools",
    product_type: "affiliate",
    is_featured: false,
    is_bestseller: false,
    is_approved: true,
    created_at: "2023-06-01T00:00:00Z",
    updated_at: "2023-06-01T00:00:00Z",
    average_rating: 4.7,
    review_count: 95
  },
  {
    id: "ht004",
    title: "Professional Pliers Set (5-Piece)",
    description: "Includes needle nose, diagonal, slip joint, and lineman pliers",
    image_url: "https://m.media-amazon.com/images/I/71R5KzkJk6L._AC_SL1500_.jpg",
    price: 49.99,
    category_id: "hand-tools",
    product_type: "affiliate",
    is_featured: true,
    is_bestseller: false,
    is_approved: true,
    created_at: "2023-06-10T00:00:00Z",
    updated_at: "2023-06-10T00:00:00Z",
    average_rating: 4.6,
    review_count: 112
  },
  {
    id: "ht005",
    title: "Heavy Duty Ball Pein Hammer",
    description: "16oz steel head with fiberglass handle for reduced vibration",
    image_url: "https://m.media-amazon.com/images/I/61Z2xPXuH+L._AC_SL1500_.jpg",
    price: 24.99,
    category_id: "hand-tools",
    product_type: "affiliate",
    is_featured: false,
    is_bestseller: false,
    is_approved: true,
    created_at: "2023-06-15T00:00:00Z",
    updated_at: "2023-06-15T00:00:00Z",
    average_rating: 4.4,
    review_count: 78
  },
  {
    id: "ht006",
    title: "Socket Wrench Set with Quick-Release (40-Piece)",
    description: "Complete set with ratchet handle, extensions, and sockets in SAE and metric sizes",
    image_url: "https://m.media-amazon.com/images/I/81BqpxqH0HL._AC_SL1500_.jpg",
    price: 59.99,
    category_id: "hand-tools",
    product_type: "affiliate",
    is_featured: false,
    is_bestseller: true,
    is_approved: true,
    created_at: "2023-06-20T00:00:00Z",
    updated_at: "2023-06-20T00:00:00Z",
    average_rating: 4.8,
    review_count: 189
  }
];

// Static subcategory data for Hand Tools
const handToolsSubcategories = [
  {
    id: "wrenches",
    name: "Wrenches & Wrench Sets",
    slug: "wrenches",
    description: "Find the perfect wrench for any job"
  },
  {
    id: "sockets",
    name: "Sockets & Socket Sets", 
    slug: "sockets",
    description: "Complete socket sets for professionals"
  },
  {
    id: "pliers",
    name: "Pliers",
    slug: "pliers",
    description: "Grip, bend and cut with precision"
  },
  {
    id: "screwdrivers",
    name: "Screwdrivers",
    slug: "screwdrivers",
    description: "For all your fastening needs"
  }
];

// Category icons mapping
const categoryIcons = {
  "wrenches": Wrench,
  "sockets": Wrench,
  "pliers": Pliers,
  "screwdrivers": Screwdriver,
  "hammers": Hammer
};

const LoadingFallback = () => (
  <ShoppingPageLayout 
    title="Loading Category" 
    description="Please wait while we load the category details"
  >
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse">Loading products...</p>
    </div>
  </ShoppingPageLayout>
);

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  return (
    <ShoppingPageLayout 
      title="Error Loading Category" 
      description="We encountered a problem loading this category."
      error={error?.message || "An unexpected error occurred. Please try refreshing the page."}
    >
      <div className="flex flex-col items-center justify-center py-8">
        <Alert variant="destructive" className="mb-6 max-w-lg mx-auto">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Failed to load category</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error?.message || "An unexpected error occurred"}</p>
            <p className="text-xs text-muted-foreground">Error details: {error?.stack?.split('\n')[0]}</p>
            {slug && (
              <p className="text-sm">
                Tried to load: <span className="font-mono bg-gray-100 px-1 rounded">{slug}</span>
              </p>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button 
            onClick={() => {
              // Clear local storage cache if any
              try {
                const cacheKeys = Object.keys(localStorage).filter(key => 
                  key.startsWith('category_') || key.startsWith('products_')
                );
                cacheKeys.forEach(key => localStorage.removeItem(key));
              } catch (err) {
                console.error("Error clearing cache:", err);
              }
              resetErrorBoundary();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh Page
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/shopping/categories')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            View All Categories
          </Button>
        </div>
      </div>
    </ShoppingPageLayout>
  );
};

const CategoryDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { 
    category, 
    products: fetchedProducts, 
    isLoading, 
    productsLoading,
    error, 
    filterOptions,
    updateFilters,
    similarCategories,
    diagnosticInfo,
    handleRetry
  } = useCategoryDetail(slug);
  
  const [pageTitle, setPageTitle] = useState('Category');
  const [displayedProducts, setDisplayedProducts] = useState(handToolsProducts);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>(handToolsSubcategories);
  
  useEffect(() => {
    // Update page title when category is loaded
    if (category) {
      setPageTitle(category.name);
      setCategoryData(category);
    } else if (slug) {
      // If we have a slug but no category, use a formatted version of the slug
      const formattedSlug = slug.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setPageTitle(formattedSlug);
      
      // Create a mock category based on the slug
      setCategoryData({
        id: slug,
        name: formattedSlug,
        slug: slug,
        description: slug === 'hand-tools' ? 
          "Essential hand tools for every mechanic and DIY enthusiast" : 
          `Browse our selection of ${formattedSlug}`,
        subcategories: slug === 'hand-tools' ? handToolsSubcategories : []
      });
      
      // Set subcategories for hand-tools
      if (slug === 'hand-tools') {
        setSubcategories(handToolsSubcategories);
      }
    }
    
    // If we have fetched products, use them instead of static data
    if (fetchedProducts && fetchedProducts.length > 0) {
      setDisplayedProducts(fetchedProducts);
    } else if (slug === 'hand-tools') {
      // Only use static data for hand-tools category
      setDisplayedProducts(handToolsProducts);
    } else {
      // For other categories, show whatever was fetched (or empty)
      setDisplayedProducts(fetchedProducts || []);
    }
  }, [category, slug, fetchedProducts]);

  // Prepare breadcrumbs based on the current category
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Shop', path: '/shopping' },
      { label: 'Categories', path: '/shopping/categories' }
    ];
    
    if (categoryData) {
      breadcrumbs.push({ 
        label: categoryData.name,
        path: `/shopping/categories/${categoryData.slug}`
      });
    } else if (slug) {
      breadcrumbs.push({ 
        label: slug.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        path: `/shopping/categories/${slug}`
      });
    }
    
    return breadcrumbs;
  };

  // Filter products based on selected subcategory
  const handleSubcategoryClick = (subcategoryId: string) => {
    if (subcategoryId === categoryData?.id) {
      // Show all products for the main category
      setDisplayedProducts(handToolsProducts);
    } else {
      // Filter products for the subcategory (in a real app, this would be a backend query)
      // For now, just simulate filtering by showing a subset of products
      setDisplayedProducts(handToolsProducts.slice(0, 3));
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Show error state
  if (error && !categoryData) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ShoppingPageLayout 
          title="Category Not Found" 
          description="We couldn't find the category you were looking for."
          error={error}
          breadcrumbs={getBreadcrumbs()}
        >
          <div className="flex flex-col items-center justify-center py-8">
            <Button 
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
            
            {similarCategories.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">You might be looking for:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarCategories.map((cat) => (
                    <Link 
                      key={cat.id}
                      to={`/shopping/categories/${cat.slug}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium">{cat.name}</h4>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ShoppingPageLayout>
      </ErrorBoundary>
    );
  }

  return (
    <ShoppingPageLayout
      title={pageTitle}
      description={categoryData?.description || "Browse our collection of tools"}
      breadcrumbs={getBreadcrumbs()}
    >
      {/* Subcategory navigation */}
      {subcategories && subcategories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant={!filterOptions.categoryId || filterOptions.categoryId === categoryData?.id ? "default" : "outline"} 
              className="rounded-full"
              onClick={() => handleSubcategoryClick(categoryData?.id)}
            >
              All {pageTitle}
            </Button>
            
            {subcategories.map((subcat) => {
              const Icon = categoryIcons[subcat.id as keyof typeof categoryIcons] || Wrench;
              return (
                <Button 
                  key={subcat.id}
                  variant={filterOptions.categoryId === subcat.id ? "default" : "outline"} 
                  className="rounded-full flex items-center gap-2"
                  onClick={() => handleSubcategoryClick(subcat.id)}
                >
                  <Icon className="h-4 w-4" />
                  {subcat.name}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ProductFilters 
            filters={filterOptions} 
            onUpdateFilters={updateFilters} 
          />
        </div>
        
        <div className="lg:col-span-3">
          {productsLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : displayedProducts && displayedProducts.length > 0 ? (
            <ProductGrid 
              products={displayedProducts} 
              isLoading={false}
              categoryName={pageTitle}
            />
          ) : (
            <div className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  No products found in this category. We're continuously adding new items to our inventory.
                </AlertDescription>
              </Alert>
              
              {/* Featured Tools Section - Shown when no real products are available */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Popular Hand Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-50 p-3 rounded-full">
                          <Wrench className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Wrench Sets</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Professional-grade wrench sets for all applications
                          </p>
                          <div className="mt-2">
                            <Badge className="bg-green-100 text-green-800 border border-green-300">
                              Most Popular
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-purple-50 p-3 rounded-full">
                          <Screwdriver className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Screwdriver Sets</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Precision screwdrivers for electronics and mechanical work
                          </p>
                          <div className="mt-2">
                            <Badge className="bg-purple-100 text-purple-800 border border-purple-300">
                              New Arrivals
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Suggestion CTA */}
              <div className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-xl text-center">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Can't find what you're looking for?</h3>
                <p className="text-blue-600 mb-4">
                  We're constantly expanding our inventory. Let us know what tools you need.
                </p>
                <Button 
                  variant="default"
                  onClick={() => {
                    try {
                      window.location.href = "/shopping/suggestions";
                    } catch (e) {
                      console.error("Navigation error:", e);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Suggest a Product
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ShoppingPageLayout>
  );
};

export default CategoryDetailPage;
