
import React, { useEffect, useState } from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw, Wrench, Hammer } from 'lucide-react';
import { useCategoryDetail } from '@/hooks/useCategoryDetail';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Product, ProductCategory } from '@/types/shopping';

const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const {
    category,
    products,
    isLoading,
    productsLoading,
    error,
    filterOptions,
    updateFilters,
    similarCategories,
    diagnosticInfo,
    handleRetry
  } = useCategoryDetail(slug);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Define top hand tools subcategories
  const handToolsCategories = [
    {
      title: "Wrenches & Wrench Sets",
      icon: Wrench,
      status: "Coming Soon"
    },
    {
      title: "Sockets & Socket Sets",
      icon: Wrench,
      status: "Coming Soon"
    },
    {
      title: "Pliers",
      icon: Wrench,
      status: "Coming Soon"
    },
    {
      title: "Screwdrivers",
      icon: Wrench,
      status: "Coming Soon"
    },
    {
      title: "Hammers & Mallets",
      icon: Hammer,
      status: "Coming Soon"
    },
    {
      title: "Pry Bars",
      icon: Wrench, 
      status: "Coming Soon"
    }
  ];

  useEffect(() => {
    if (products) {
      setFilteredProducts(products);
    }
  }, [products]);

  const handleSearch = (term: string) => {
    if (!term) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(
      product => product.title.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleCategoryClick = (categoryId: string) => {
    updateFilters({ categoryId });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (isLoading) {
    return (
      <ShoppingPageLayout title="Loading Category..." onSearch={handleSearch}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-muted-foreground">Loading category details...</p>
          </div>
        </div>
      </ShoppingPageLayout>
    );
  }

  if (error) {
    return (
      <ShoppingPageLayout title="Category Not Found" onSearch={handleSearch}>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-8">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 rounded-full p-2">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-amber-800 mb-2">Category Not Found</h2>
              <p className="text-amber-700 mb-4">{error}</p>
              
              {similarCategories.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-amber-800 mb-2">Similar categories you might be interested in:</h3>
                  <ul className="space-y-1">
                    {similarCategories.map((cat) => (
                      <li key={cat.id}>
                        <Link 
                          to={`/shopping/categories/${cat.slug}`} 
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mt-4">
                <Button 
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleRetry}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {diagnosticInfo && (
          <Card className="mt-8">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Diagnostic Information</h3>
              <pre className="bg-muted p-2 rounded text-xs whitespace-pre-wrap">
                {diagnosticInfo}
              </pre>
            </CardContent>
          </Card>
        )}
      </ShoppingPageLayout>
    );
  }

  const pageTitle = category ? category.name : slug ? slug.replace(/-/g, ' ') : 'Category';

  return (
    <ShoppingPageLayout 
      title={pageTitle} 
      description={category?.description || "Browse products in this category"} 
      onSearch={handleSearch}
    >
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shopping">Shop</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shopping/categories">Categories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
        <p className="text-muted-foreground">
          {category?.description || "Essential hand tools for every mechanic and DIY enthusiast"}
        </p>
      </div>
      
      {/* Collection Coming Soon Alert */}
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
            <div className="w-10 h-10 flex items-center justify-center text-amber-800">
              {/* Tool icon placeholder */}
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-800">Hand Tools Collection Coming Soon</h2>
            <p className="text-amber-700 mt-2">
              Our team is currently curating a selection of high-quality hand tools for automotive professionals and DIY enthusiasts. 
              Check back soon to browse our complete collection!
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="bg-white">
                Check Again
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                View All Categories
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">Top {pageTitle} Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {handToolsCategories.map((category, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.status}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <category.icon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Products section would go here when available */}
      {productsLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Available Products</h2>
            <Button
              variant="outline"
              onClick={toggleFilters}
              className="flex items-center gap-2"
            >
              <span>Filters</span>
              {showFilters ? '×' : '+'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {showFilters && (
              <div className="lg:col-span-1">
                <ProductFilters 
                  options={filterOptions} 
                  onChange={updateFilters} 
                />
              </div>
            )}
            <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <ProductGrid products={filteredProducts} />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-muted/20 rounded-lg p-8 text-center my-6">
          <h3 className="text-lg font-medium mb-2">No Products Available Yet</h3>
          <p className="mb-4 text-muted-foreground">
            We're still adding products to this category. Check back soon!
          </p>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/shopping/suggestions">Suggest a Product</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Suggestion CTA */}
      <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-800">Looking for a specific tool?</h4>
          <p className="text-sm text-blue-700 mt-1">
            If you don't see what you need, visit our <Link to="/shopping/suggestions" className="underline font-medium">product suggestions</Link> page to request it.
          </p>
        </div>
      </div>
    </ShoppingPageLayout>
  );
};

export default CategoryDetailPage;
