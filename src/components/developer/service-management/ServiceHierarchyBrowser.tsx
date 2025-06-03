
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import ServiceCategoriesManager from './ServiceCategoriesManager';
import { DuplicateSearchButton } from './DuplicateSearchButton';
import ServiceQualityAnalysis from './ServiceQualityAnalysis';
import ServiceBulkImport from './ServiceBulkImport';
import { ServiceDebugInfo } from './ServiceDebugInfo';
import ServicesPriceReport from './ServicesPriceReport';
import ServiceAnalytics from './ServiceAnalytics';
import { ServiceDuplicatesManager } from './ServiceDuplicatesManager';
import { 
  Database, 
  Search, 
  TrendingUp,
  Upload,
  Bug,
  DollarSign,
  BarChart3,
  Copy
} from 'lucide-react';

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  onRefresh: () => void;
}

const ServiceHierarchyBrowser: React.FC<ServiceHierarchyBrowserProps> = ({
  categories,
  isLoading,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleImport = async (data: any) => {
    // This would typically call an API to import the data
    console.log('Importing data:', data);
    onRefresh();
  };

  const handleExport = async () => {
    console.log('Export triggered');
    // Mock export functionality
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Hierarchy Browser</h2>
          <p className="text-gray-600">Browse, analyze, and optimize your service structure</p>
        </div>
        <div className="flex gap-2">
          <DuplicateSearchButton 
            categories={categories} 
            loading={isLoading}
            onCategoriesUpdated={onRefresh}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger 
            value="overview" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2"
          >
            <Database className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="duplicates" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white gap-2"
          >
            <Copy className="h-4 w-4" />
            Duplicates
          </TabsTrigger>
          <TabsTrigger 
            value="quality" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Quality Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="pricing" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger 
            value="import" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white gap-2"
          >
            <Upload className="h-4 w-4" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger 
            value="debug" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white gap-2"
          >
            <Bug className="h-4 w-4" />
            Debug
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="space-y-4">
            <ServiceCategoriesManager 
              categories={categories}
              isLoading={isLoading}
              onRefresh={onRefresh}
            />
          </TabsContent>

          <TabsContent value="duplicates" className="space-y-4">
            <ServiceDuplicatesManager 
              categories={categories}
              onRefresh={onRefresh}
            />
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <ServiceQualityAnalysis 
              categories={categories}
              onRefresh={onRefresh}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <ServiceAnalytics categories={categories} />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <ServicesPriceReport categories={categories} />
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <ServiceBulkImport 
              categories={categories}
              onImport={handleImport}
              onExport={handleExport}
            />
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <ServiceDebugInfo 
              categories={categories}
              isLoading={isLoading}
              error={null}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ServiceHierarchyBrowser;
