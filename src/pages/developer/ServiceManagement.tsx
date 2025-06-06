import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceHierarchyBrowser } from '@/components/developer/service-management/ServiceHierarchyBrowser';
import { ServiceManagementSettings } from '@/components/developer/service-management/ServiceManagementSettings';
import { Settings, Database, FileText, Search, Building } from 'lucide-react';
import { useServiceSectors } from '@/hooks/useServiceCategories';

const ServiceManagement: React.FC = () => {
  const { sectors, loading } = useServiceSectors();

  const totalSectors = sectors.length;
  const totalCategories = sectors.reduce((acc, sector) => acc + sector.categories.length, 0);
  const totalServices = sectors.reduce((acc, sector) => 
    acc + sector.categories.reduce((catAcc, category) => 
      catAcc + category.subcategories.reduce((subAcc, subcategory) => 
        subAcc + subcategory.jobs.length, 0), 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Management</h1>
          <p className="text-muted-foreground">
            Manage service sectors, categories, subcategories, and individual services
          </p>
        </div>
        <ServiceManagementSettings>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </ServiceManagementSettings>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Sectors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? '...' : totalSectors}</p>
            <p className="text-sm text-muted-foreground">Service sectors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? '...' : totalCategories}</p>
            <p className="text-sm text-muted-foreground">Main categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? '...' : totalServices}</p>
            <p className="text-sm text-muted-foreground">Total services</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Good</p>
            <p className="text-sm text-muted-foreground">Service indexing</p>
          </CardContent>
        </Card>
      </div>

      <ServiceHierarchyBrowser />
    </div>
  );
};

export default ServiceManagement;
