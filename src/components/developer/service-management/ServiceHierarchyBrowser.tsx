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
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
  const [newCategoryName, setNewCategoryName] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
    } catch (err: any) {
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
      // Optimistically update the UI
      setCategories(prevCategories => [...data]);
      
      // TODO: Implement actual import logic using serviceApi
      console.log('Importing data:', data);
      toast({
        title: "Success",
        description: "Service categories imported successfully",
      });
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Import failed');
      toast({
        title: "Error",
        description: "Failed to import service categories",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Categories</h2>
        <Button onClick={() => {
          // TODO: Implement add category logic
          console.log('Add category clicked');
        }}>
          Add Category
        </Button>
      </div>
      
      <ServiceBulkImport
        categories={categories}
        onImport={handleImport}
        onExport={() => {
          // Export functionality is handled within ServiceBulkImport
        }}
      />

      <Accordion type="multiple" collapsible>
        {categories.map(category => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger>{category.name}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">
                {category.description || 'No description'}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
