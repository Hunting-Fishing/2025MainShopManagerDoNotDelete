
import React, { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useLocation } from 'react-router-dom';
import { ShoppingHeader } from './ShoppingHeader';
import { Card } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { WishlistPanel } from './WishlistPanel';

interface ShoppingPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  error?: string | null;
  warning?: string | null;
  info?: string | null;
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
  warning = null,
  info = null,
  breadcrumbs = [],
  onSearch = () => {}
}) => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  const [showWishlist, setShowWishlist] = useState(false);
  
  const handleSearch = (term: string) => {
    console.log("Search term:", term);
    onSearch(term);
  };
  
  const handleToggleFilters = () => {
    console.log("Toggle filters");
  };
  
  const handleToggleWishlist = () => {
    setShowWishlist(!showWishlist);
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
      
      if (paths.includes('categories')) {
        currentPath += '/categories';
        crumbs.push({ label: 'Categories', path: currentPath });
        
        // If we have a category slug
        if (paths.length > 2) {
          const categorySlug = paths[paths.length - 1];
          const categoryName = categorySlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          crumbs.push({ label: categoryName });
        }
      } else if (paths.includes('product') && paths.length > 2) {
        currentPath += '/product';
        crumbs.push({ label: 'Product', path: currentPath });
        
        // Just show a placeholder for the product ID
        crumbs.push({ label: 'Product Details' });
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
                  crumb.path ? (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.path}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground">{crumb.label}</span>
                  )
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
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {warning && (
        <Alert variant="warning" className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Warning</AlertTitle>
          <AlertDescription className="text-amber-700">{warning}</AlertDescription>
        </Alert>
      )}
      
      {info && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Information</AlertTitle>
          <AlertDescription className="text-blue-700">{info}</AlertDescription>
        </Alert>
      )}
      
      {children}
      
      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          As an Amazon Associate, we earn from qualifying purchases.
          This means at no additional cost to you, we earn a commission if you click through and make a purchase.
        </p>
      </div>
      
      <WishlistPanel 
        visible={showWishlist} 
        onClose={() => setShowWishlist(false)} 
      />
    </div>
  );
};
