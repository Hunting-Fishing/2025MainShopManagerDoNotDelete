import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from 'react-router-dom';
import { ShoppingHeader } from './ShoppingHeader';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ShoppingPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  error?: string | null;
  breadcrumbs?: Array<{
    label: string;
    path?: string;
  }>;
  onSearch?: (term: string) => void;
}

export const ShoppingPageLayout: React.FC<ShoppingPageLayoutProps> = ({
  title,
  description,
  children,
  error = null,
  breadcrumbs = [],
  onSearch = () => {}
}) => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  const handleSearch = (term: string) => {
    console.log("Search term:", term);
    onSearch(term);
  };
  
  const handleToggleFilters = () => {
    console.log("Toggle filters");
  };
  
  const handleToggleWishlist = () => {
    console.log("Toggle wishlist");
  };
  
  const getBreadcrumbs = () => {
    // If custom breadcrumbs are provided, use those
    if (breadcrumbs.length > 0) {
      return breadcrumbs;
    }
    
    // Otherwise, generate from the URL path
    const crumbs = [];
    let currentPath = '';
    
    crumbs.push({ label: 'Home', path: '/' });
    
    if (paths.includes('shopping')) {
      currentPath += '/shopping';
      crumbs.push({ label: 'Shop', path: currentPath });
      
      if (paths.includes('categories') && paths.length > 2) {
        currentPath += '/categories';
        crumbs.push({ label: 'Categories', path: currentPath });
        
        const categorySlug = paths[paths.length - 1];
        const categoryName = categorySlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        crumbs.push({ label: categoryName });
      } else if (paths.length > 1) {
        const lastPath = paths[paths.length - 1];
        const formattedPath = lastPath
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        crumbs.push({ label: formattedPath });
      }
    }
    
    return crumbs;
  };
  
  const generatedBreadcrumbs = getBreadcrumbs();
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ShoppingHeader 
        onSearch={handleSearch}
        onToggleFilters={handleToggleFilters}
        onToggleWishlist={handleToggleWishlist}
      />
      
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          {generatedBreadcrumbs.map((crumb, index) => (
            <div key={`breadcrumb-${index}`}>
              <BreadcrumbItem>
                {index === generatedBreadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.path}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < generatedBreadcrumbs.length - 1 && (
                <BreadcrumbSeparator />
              )}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      
      {error && (
        <Card className="bg-red-50 border-red-200 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </Card>
      )}
      
      {children}
      
      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          As an Amazon Associate, we earn from qualifying purchases.
          This means at no additional cost to you, we earn a commission if you click through and make a purchase.
        </p>
      </div>
    </div>
  );
};
