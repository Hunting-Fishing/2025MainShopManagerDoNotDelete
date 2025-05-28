
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ServiceAnalytics from '@/components/developer/service-management/ServiceAnalytics';
import ServiceBulkImport from '@/components/developer/service-management/ServiceBulkImport';
import ServicesPriceReport from '@/components/developer/service-management/ServicesPriceReport';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { fetchServiceCategories } from '@/lib/services/serviceApi';

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState("services");
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const serviceCategories = await fetchServiceCategories();
        setCategories(serviceCategories);
      } catch (error) {
        console.error('Failed to load service categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleBulkImportCancel = () => {
    setActiveTab("services");
  };

  const handleBulkImportComplete = (importedCategories: ServiceMainCategory[]) => {
    setCategories(importedCategories);
    setActiveTab("services");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/developer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Service Management</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Configure available services, subcategories, and jobs with pricing
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger value="services" className="rounded-full text-sm px-4 py-2">
            Services
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-full text-sm px-4 py-2">
            Pricing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full text-sm px-4 py-2">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="import" className="rounded-full text-sm px-4 py-2">
            Import/Export
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6">
          <TabsContent value="services" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Service Categories</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Manage your service hierarchy including main categories, subcategories, and individual service jobs.
              </p>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading services...</p>
                </div>
              ) : categories.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-green-600">{categories.length} categories loaded</p>
                  <div className="grid gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.subcategories.length} subcategories</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No services configured yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Use the Import/Export tab to set up your services
                  </p>
                </div>
              )}
            </div>
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
