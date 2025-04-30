
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCategoryDetail } from '@/hooks/useCategoryDetail';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { Button } from '@/components/ui/button';
import { CategoryToolList } from '@/components/shopping/CategoryToolList';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { SeoHead } from '@/components/common/SeoHead';
import { normalizeSlug } from '@/utils/slugUtils';

const CategoryDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { 
    category, 
    products, 
    isLoading, 
    productsLoading,
    error, 
    filterOptions, 
    updateFilters,
    similarCategories,
    diagnosticInfo 
  } = useCategoryDetail(slug);

  // Generate breadcrumbs specifically for this page
  const customBreadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shopping' },
    { label: 'Categories', path: '/shopping/categories' },
    { label: category?.name || 'Category' }
  ];

  // State for tracking if any item is coming soon
  const [hasComingSoonItems, setHasComingSoonItems] = useState(false);

  useEffect(() => {
    // Check if any products are in the coming soon state
    if (products && products.length > 0) {
      const comingSoon = products.some(product => product.metadata && JSON.parse(product.metadata).status === 'coming_soon');
      setHasComingSoonItems(comingSoon);
    }
  }, [products]);

  if (isLoading) {
    return (
      <ShoppingPageLayout 
        title="Loading Category..." 
        description="Please wait while we load the category details"
        breadcrumbs={customBreadcrumbs}
      >
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ShoppingPageLayout>
    );
  }

  if (error) {
    return (
      <ShoppingPageLayout 
        title="Category Not Found" 
        error={`We couldn't find the category "${slug}"`}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Shop', path: '/shopping' },
          { label: 'Categories', path: '/shopping/categories' },
          { label: 'Not Found' }
        ]}
      >
        {similarCategories && similarCategories.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Similar Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarCategories.map((cat) => (
                <Card key={cat.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link
                      to={`/shopping/categories/${cat.slug}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800"
                    >
                      {cat.name}
                    </Link>
                    {cat.description && (
                      <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link to="/shopping/categories">
            <Button variant="outline">Browse All Categories</Button>
          </Link>
        </div>
      </ShoppingPageLayout>
    );
  }

  if (!category) {
    return (
      <ShoppingPageLayout 
        title="Category Not Found" 
        error="Category information could not be loaded"
        breadcrumbs={customBreadcrumbs}
      >
        <div className="my-8">
          <Link to="/shopping/categories">
            <Button variant="outline">Browse All Categories</Button>
          </Link>
        </div>
      </ShoppingPageLayout>
    );
  }

  // Generate SEO-friendly meta title and description
  const pageTitle = `${category.name} Tools - Shop Online`;
  const pageDescription = category.description || `Browse our selection of ${category.name} tools and equipment for your automotive needs.`;
  
  // Check if we have subcategories to display
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  
  // Prepare tool categories for display
  const toolCategoriesData = hasSubcategories 
    ? category.subcategories?.map(sub => ({
        category: sub.name,
        description: sub.description || `Browse our selection of ${sub.name}.`,
        items: [], // We don't have items at this level
        slug: sub.slug
      })) 
    : [];

  return (
    <>
      <SeoHead 
        title={pageTitle}
        description={pageDescription}
        keywords={`${category.name}, automotive tools, shop tools, mechanic tools, ${normalizeSlug(category.name)}`}
      />
      
      <ShoppingPageLayout
        title={category.name}
        description={category.description}
        breadcrumbs={customBreadcrumbs}
        onSearch={(term) => updateFilters({ search: term })}
      >
        {hasComingSoonItems && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Coming Soon</h3>
              <p className="text-sm text-blue-700">
                Some items in this category are coming soon. Pre-orders may be available.
              </p>
            </div>
          </div>
        )}

        {hasSubcategories && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Browse {category.name} Categories</h2>
            <CategoryToolList 
              tools={toolCategoriesData} 
              title="" 
              description="" 
            />
          </div>
        )}

        <div className="mt-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ProductFilters 
                filters={filterOptions} 
                onUpdateFilters={updateFilters} 
              />
            </div>
            
            <div className="lg:col-span-3">
              <ProductGrid 
                products={products} 
                isLoading={productsLoading} 
              />
              
              {products.length === 0 && !productsLoading && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Looking for a specific {category.name.toLowerCase()} tool?</h4>
            <p className="text-sm text-amber-700 mt-1">
              If you don't see what you need, visit our <Link to="/shopping/suggestions" className="underline font-medium">product suggestions</Link> page to request it.
            </p>
          </div>
        </div>
      </ShoppingPageLayout>
    </>
  );
};

export default CategoryDetailPage;
