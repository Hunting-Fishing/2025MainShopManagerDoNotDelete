
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import ServiceCategoriesManager from './ServiceCategoriesManager';
import { DuplicateSearchButton } from './DuplicateSearchButton';
import ServiceQualityAnalysis from './ServiceQualityAnalysis';
import { 
  Database, 
  Search, 
  TrendingUp,
  AlertTriangle
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
            value="quality" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Quality Analysis
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

          <TabsContent value="quality" className="space-y-4">
            <ServiceQualityAnalysis 
              categories={categories}
              onRefresh={onRefresh}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ServiceHierarchyBrowser;
