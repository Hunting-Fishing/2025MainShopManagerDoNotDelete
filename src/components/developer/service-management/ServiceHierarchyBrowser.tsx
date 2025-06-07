
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceHierarchyTreeView } from './ServiceHierarchyTreeView';
import { ServiceHierarchyExcelView } from './ServiceHierarchyExcelView';
import { ServiceSectorsList } from './ServiceSectorsList';
import { FreshServiceImport } from './FreshServiceImport';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { TreePine, Table, Upload, BarChart3, Database } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ServiceHierarchyBrowser() {
  const { sectors, loading, error, refetch } = useServiceSectors();
  const [activeTab, setActiveTab] = useState('overview');

  const handleSave = (data: any) => {
    console.log('Saving live service data:', data);
    // Implementation for saving changes would go here
  };

  const handleImportComplete = () => {
    console.log('Import completed, refreshing live data...');
    // Refresh data after successful import
    refetch();
  };

  const handleDownload = () => {
    console.log('Download functionality not implemented yet');
  };

  // Convert sectors to categories for components that expect categories
  const allCategories = sectors.flatMap(sector => sector.categories);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading live service hierarchy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Alert variant="destructive" className="mb-4">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Error loading live service hierarchy: {error}
          </AlertDescription>
        </Alert>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry Loading Live Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          All data shown below is live from your Supabase database. No mock or sample data is displayed.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Live Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex items-center space-x-2">
            <TreePine className="h-4 w-4" />
            <span>Live Tree View</span>
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center space-x-2">
            <Table className="h-4 w-4" />
            <span>Live Excel View</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import to Live DB</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ServiceSectorsList />
        </TabsContent>

        <TabsContent value="tree" className="mt-6">
          <ServiceHierarchyTreeView 
            categories={allCategories}
          />
        </TabsContent>

        <TabsContent value="excel" className="mt-6">
          <ServiceHierarchyExcelView 
            categories={allCategories}
            onDownload={handleDownload}
          />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <FreshServiceImport onImportComplete={handleImportComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
