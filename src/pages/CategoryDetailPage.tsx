
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCategoryDetail } from '@/hooks/useCategoryDetail';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home, MessageSquarePlus, Grid3X3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types/shopping';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { slugify } from '@/utils/slugUtils';

interface SubcategoryProps {
  name: string;
  slug: string;
  description?: string;
  itemCount: number;
  isNew?: boolean;
  isPopular?: boolean;
}

const CategoryDetailPage = () => {
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
    similarCategories 
  } = useCategoryDetail(slug);

  // For demo purposes, let's create some subcategories for the Hand Tools category
  const subcategories: SubcategoryProps[] = [
    {
      name: "Screwdrivers",
      slug: "screwdrivers",
      description: "Phillips, flathead, and specialty screwdrivers",
      itemCount: 24,
      isPopular: true
    },
    {
      name: "Wrenches",
      slug: "wrenches",
      description: "Fixed and adjustable wrenches for every application",
      itemCount: 18
    },
    {
      name: "Pliers",
      slug: "pliers",
      description: "Needle nose, slip joint, and specialty pliers",
      itemCount: 15
    },
    {
      name: "Hammers",
      slug: "hammers",
      description: "Ball peen, dead blow, and mallets",
      itemCount: 12
    },
    {
      name: "Specialty Tools",
      slug: "specialty-tools",
      description: "Specialized hand tools for specific applications",
      itemCount: 32,
      isNew: true
    },
    {
      name: "Tool Sets",
      slug: "tool-sets",
      description: "Complete hand tool kits and sets",
      itemCount: 9,
      isPopular: true
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800">Error Loading Category</h2>
          <p className="text-red-600 mt-2">{error}</p>
          {similarCategories.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Did you mean one of these categories?</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {similarCategories.map((cat) => (
                  <Button 
                    key={cat.id} 
                    variant="outline"
                    onClick={() => navigate(`/shopping/categories/${cat.slug}`)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <Button 
            className="mt-6"
            onClick={() => navigate('/shopping/categories')}
          >
            Return to Categories
          </Button>
        </div>
      </div>
    );
  }

  // Get the category name from the URL slug if category is not available
  const categoryName = category?.name || slug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Get a list of products for this page (will be empty if no products)
  const categoryProducts: Product[] = products || [];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/shopping">Shop</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/shopping/categories">Categories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{categoryName}</h1>
        <p className="text-muted-foreground mt-2">
          Browse our collection of {categoryName.toLowerCase()} for your automotive needs.
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-blue-800">Product Suggestions Coming Soon</h3>
            <p className="text-blue-700 text-sm mt-1">
              We're working on adding more products to this category. Check back soon!
            </p>
          </div>
          <Button 
            onClick={() => navigate('/shopping/suggestions')} 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            Suggest a Product
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Subcategories + Filters */}
        <div className="space-y-6">
          {/* Subcategories List */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-lg mb-4">
                {categoryName} Categories
              </h2>
              <div className="space-y-3">
                {subcategories.map((subcat) => (
                  <div 
                    key={subcat.slug}
                    className="flex items-center justify-between hover:bg-slate-50 p-2 rounded-md cursor-pointer"
                    onClick={() => navigate(`/shopping/categories/${slug}/${subcat.slug}`)}
                  >
                    <div className="flex items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm">{subcat.name}</span>
                          {subcat.isNew && (
                            <Badge className="ml-2 bg-purple-100 text-purple-800 border border-purple-300 text-xs">
                              New
                            </Badge>
                          )}
                          {subcat.isPopular && !subcat.isNew && (
                            <Badge className="ml-2 bg-green-100 text-green-800 border border-green-300 text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {subcat.itemCount} items
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-sm p-2 h-auto"
                  onClick={() => navigate('/shopping/categories')}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  View all categories
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <ProductFilters 
            filters={filterOptions}
            onUpdateFilters={updateFilters}
          />
        </div>

        {/* Right Column - Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid 
            products={categoryProducts}
            isLoading={productsLoading}
            categoryName={categoryName}
            emptyMessage={`We don't have any ${categoryName.toLowerCase()} products yet.`}
          />
          
          {/* Suggestion CTA */}
          <div className="mt-8 bg-gray-50 rounded-xl border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Can't find what you're looking for?</h3>
              <p className="text-muted-foreground mt-1">
                Suggest products you'd like to see in our collection.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/shopping/suggestions')}
              className="whitespace-nowrap"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Suggest Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
