
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface SettingsPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultTab?: string;
  isLoading?: boolean;
}

export const SettingsPageLayout: React.FC<SettingsPageLayoutProps> = ({ 
  title, 
  description, 
  children,
  defaultTab,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If there's a tab parameter in the URL, and we have a defaultTab, append it to the URL
    if (defaultTab && !location.search.includes('tab=')) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('tab', defaultTab);
      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    }
  }, [location, navigate, defaultTab]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between my-6">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2 sm:mb-0" 
            onClick={() => navigate("/settings")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Settings
          </Button>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600 font-medium">Loading content...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
