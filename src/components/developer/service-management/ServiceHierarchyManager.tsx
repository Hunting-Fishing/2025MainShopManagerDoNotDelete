
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { AlertCircle, Plus, Save, Upload, Download, Trash2, Edit } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ServiceCategoryList from './ServiceCategoryList';
import ServiceCategoryEditor from './ServiceCategoryEditor';
import ServiceBulkImport from './ServiceBulkImport';

export default function ServiceHierarchyManager() {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const queryClient = useQueryClient();

  // Fetch all service categories
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['serviceHierarchy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_hierarchy')
        .select('*')
        .order('position');
      
      if (error) throw new Error(error.message);
      return data as ServiceMainCategory[];
    },
  });

  // Save or update a category
  const saveCategory = useMutation({
    mutationFn: async (category: ServiceMainCategory) => {
      const { data, error } = await supabase
        .from('service_hierarchy')
        .upsert(category)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Category saved",
        description: "The service category has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['serviceHierarchy'] });
    },
    onError: (error) => {
      toast({
        title: "Error saving category",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a category
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_hierarchy')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Category deleted",
        description: "The service category has been deleted.",
      });
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }
      queryClient.invalidateQueries({ queryKey: ['serviceHierarchy'] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Export categories to JSON
  const handleExport = () => {
    if (!categories) return;
    
    const dataStr = JSON.stringify(categories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = `service_categories_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    toast({
      title: "Export successful",
      description: `Categories exported to ${exportFileName}`,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Hierarchy Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading service categories: {error.toString()}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="browse">Browse Categories</TabsTrigger>
          <TabsTrigger value="edit">Edit Categories</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-10">Loading service categories...</div>
          ) : (
            <ServiceCategoryList 
              categories={categories || []} 
              onSelectCategory={setSelectedCategory}
              onDeleteCategory={(id) => deleteCategory.mutate(id)}
              selectedCategory={selectedCategory}
            />
          )}
        </TabsContent>
        
        <TabsContent value="edit">
          <ServiceCategoryEditor 
            category={selectedCategory}
            onSave={(category) => saveCategory.mutate(category)}
            onCancel={() => setActiveTab('browse')}
          />
        </TabsContent>
        
        <TabsContent value="import">
          <ServiceBulkImport 
            onImportSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['serviceHierarchy'] });
              setActiveTab('browse');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
