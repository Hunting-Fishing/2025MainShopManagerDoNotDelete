
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceHierarchyTreeView } from './ServiceHierarchyTreeView';
import { ServiceHierarchyExcelView } from './ServiceHierarchyExcelView';
import { ServiceSectorsList } from './ServiceSectorsList';
import { FreshServiceImport } from './FreshServiceImport';
import { useServiceManagementState } from '@/hooks/useServiceManagementState';
import { TreePine, Table, Upload, BarChart3 } from 'lucide-react';

export function ServiceHierarchyBrowser() {
  const { sectors, loading, error, refetch } = useServiceManagementState();
  const [activeTab, setActiveTab] = useState('overview');

  const handleSave = (data: any) => {
    console.log('Saving service data:', data);
    // Implementation for saving changes would go here
  };

  const handleImportComplete = async () => {
    console.log('Import completed, refreshing service data...');
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh after import:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading service hierarchy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error loading service hierarchy: {error}</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex items-center space-x-2">
            <TreePine className="h-4 w-4" />
            <span>Tree View</span>
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center space-x-2">
            <Table className="h-4 w-4" />
            <span>Excel View</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ServiceSectorsList />
        </TabsContent>

        <TabsContent value="tree" className="mt-6">
          <ServiceHierarchyTreeView 
            sectors={sectors}
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="excel" className="mt-6">
          <ServiceHierarchyExcelView 
            sectors={sectors}
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <FreshServiceImport onImportComplete={handleImportComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
