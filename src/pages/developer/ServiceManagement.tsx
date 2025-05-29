
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ServiceAnalytics from '@/components/developer/service-management/ServiceAnalytics';
import ServiceBulkImport from '@/components/developer/service-management/ServiceBulkImport';
import ServicesPriceReport from '@/components/developer/service-management/ServicesPriceReport';
import ServiceHierarchyBrowser from '@/components/developer/service-management/ServiceHierarchyBrowser';
import ServiceDebugInfo from '@/components/developer/service-management/ServiceDebugInfo';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { toast } from 'sonner';

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState("services");
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading service categories from database...');
      
      const serviceCategories = await fetchServiceCategories();
      console.log('Loaded categories:', serviceCategories);
      setCategories(serviceCategories);
      
      if (serviceCategories.length === 0) {
        console.log('No categories found in database');
      } else {
        toast.success(`Loaded ${serviceCategories.length} service categories`);
      }
    } catch (error) {
      console.error('Failed to load service categories:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load service categories: ${errorMessage}`);
      toast.error('Failed to load service categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleBulkImportCancel = () => {
    setActiveTab("services");
  };

  const handleBulkImportComplete = (importedCategories: ServiceMainCategory[]) => {
    console.log('Import completed, refreshing categories...');
    setCategories(importedCategories);
    setActiveTab("services");
    // Refresh the data from database after import
    setTimeout(() => {
      loadCategories();
    }, 1000);
    toast.success('Service categories imported successfully');
  };

  const handleRefresh = async () => {
    await loadCategories();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/developer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
          </Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold">Service Management</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300">
          Manage service categories, subcategories, and jobs with real-time database integration
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Information */}
      <div className="mb-6">
        <ServiceDebugInfo />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger 
            value="services" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            Services
          </TabsTrigger>
          <TabsTrigger 
            value="pricing" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Pricing
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="import" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Import/Export
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6">
          <TabsContent value="services" className="space-y-6">
            <ServiceHierarchyBrowser 
              categories={categories} 
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <ServicesPriceReport categories={categories} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ServiceAnalytics categories={categories} />
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <ServiceBulkImport 
              onCancel={handleBulkImportCancel}
              onComplete={handleBulkImportComplete}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
