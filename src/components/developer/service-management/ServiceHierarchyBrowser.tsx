
import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchServiceCategories,
  updateServiceCategory,
  deleteServiceCategory,
  updateServiceSubcategory,
  deleteServiceSubcategory,
  updateServiceJob,
  deleteServiceJob
} from '@/lib/services/serviceApi';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from '@/hooks/use-toast';
import { ServiceBulkImport } from './ServiceBulkImport';

export const ServiceHierarchyBrowser: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading service categories...');
      const data = await fetchServiceCategories();
      console.log('Loaded categories:', data);
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setError(err.message || 'Failed to load categories');
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleImport = async (data: ServiceMainCategory[]) => {
    try {
      console.log('Import completed, refreshing categories...');
      
      // Refresh the categories from the database to get the latest data
      await loadCategories();
      
      toast({
        title: "Success",
        description: `Successfully imported ${data.length} service categories`,
      });
    } catch (err: any) {
      console.error('Post-import refresh failed:', err);
      setError(err.message || 'Import completed but failed to refresh data');
      toast({
        title: "Warning", 
        description: "Import completed but failed to refresh display. Please refresh manually.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    loadCategories();
  };

  const getTotalCounts = () => {
    const totalSubcategories = categories.reduce((total, cat) => total + cat.subcategories.length, 0);
    const totalJobs = categories.reduce((total, cat) => 
      total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0);
    
    return { totalSubcategories, totalJobs };
  };

  const { totalSubcategories, totalJobs } = getTotalCounts();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Service Categories</h2>
          <div className="animate-pulse">Loading...</div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading service categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Categories</h2>
          <p className="text-gray-600">
            {categories.length} categories • {totalSubcategories} subcategories • {totalJobs} services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => {
            // TODO: Implement add category logic
            console.log('Add category clicked');
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>
      
      <ServiceBulkImport
        categories={categories}
        onImport={handleImport}
        onExport={() => {
          // Export functionality is handled within ServiceBulkImport
        }}
      />

      {error && (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <Button variant="outline" onClick={handleRefresh} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {!error && categories.length === 0 && (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500 mb-2">No service categories found</p>
          <p className="text-sm text-gray-400">Use the import feature above to add service categories</p>
        </div>
      )}

      {!error && categories.length > 0 && (
        <Accordion type="multiple" className="w-full">
          {categories.map(category => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center justify-between w-full mr-4">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-gray-500">
                    {category.subcategories.length} subcategories
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-4">
                  <p className="text-sm text-muted-foreground">
                    {category.description || 'No description'}
                  </p>
                  
                  {category.subcategories.length > 0 && (
                    <div className="space-y-3">
                      {category.subcategories.map(subcategory => (
                        <div key={subcategory.id} className="border-l-2 border-gray-200 pl-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{subcategory.name}</h4>
                            <span className="text-xs text-gray-500">
                              {subcategory.jobs.length} services
                            </span>
                          </div>
                          
                          {subcategory.description && (
                            <p className="text-xs text-gray-600 mt-1">{subcategory.description}</p>
                          )}
                          
                          {subcategory.jobs.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {subcategory.jobs.map(job => (
                                <div key={job.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                                  <div>
                                    <span className="font-medium">{job.name}</span>
                                    {job.description && (
                                      <span className="text-gray-600 ml-2">- {job.description}</span>
                                    )}
                                  </div>
                                  <div className="flex gap-4 text-gray-500">
                                    {job.estimatedTime && <span>{job.estimatedTime}min</span>}
                                    {job.price && <span>${job.price}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {category.subcategories.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No subcategories defined</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
