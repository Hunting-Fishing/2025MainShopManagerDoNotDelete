
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { AlertCircle, Plus, Save, Download, FileDown, FileUp, Database, Clipboard } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ServiceCategoryList from './ServiceCategoryList';
import ServiceCategoryEditor from './ServiceCategoryEditor';
import { ServiceBulkImport } from './ServiceBulkImport';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';
import { createEmptyCategory } from '@/lib/services/serviceUtils';
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import { Input } from '@/components/ui/input';

export default function ServiceHierarchyManager() {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all service categories
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['serviceHierarchy'],
    queryFn: fetchServiceCategories,
  });

  // Save or update a category
  const saveCategory = useMutation({
    mutationFn: saveServiceCategory,
    onSuccess: () => {
      toast({
        title: "Category saved",
        description: "The service category has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['serviceHierarchy'] });
      setActiveTab('browse');
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
    mutationFn: deleteServiceCategory,
    onSuccess: (deletedId: string) => {
      toast({
        title: "Category deleted",
        description: "The service category has been deleted.",
      });
      if (selectedCategory && selectedCategory.id === deletedId) {
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

  // Copy categories JSON to clipboard
  const handleCopyToClipboard = () => {
    if (!categories) return;
    
    const dataStr = JSON.stringify(categories, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Service categories JSON copied to clipboard.",
      });
    });
  };

  const handleSelectCategory = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setActiveTab('edit');
  };

  const handleSaveCategory = (category: ServiceMainCategory) => {
    saveCategory.mutate(category);
  };

  // Function to add a new category
  const handleAddCategory = () => {
    const newCategory: ServiceMainCategory = createEmptyCategory(categories ? categories.length : 0);
    
    setSelectedCategory(newCategory);
    setActiveTab('edit');
  };

  // Handle category analytics
  const handleAnalytics = () => {
    setActiveTab('analytics');
  };

  // Get services stats
  const getCategoryStats = () => {
    if (!categories || categories.length === 0) return { categories: 0, subcategories: 0, services: 0 };
    
    const totalSubcategories = categories.reduce((total, cat) => total + cat.subcategories.length, 0);
    const totalServices = categories.reduce((total, cat) => 
      total + cat.subcategories.reduce(
        (subTotal, sub) => subTotal + sub.jobs.length, 0
      ), 0
    );
    
    return {
      categories: categories.length,
      subcategories: totalSubcategories,
      services: totalServices
    };
  };
  
  const stats = getCategoryStats();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Service Hierarchy Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage service categories, subcategories, and individual service jobs
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" /> Export
          </Button>
          <Button onClick={handleAddCategory} className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
            <Plus className="h-4 w-4" /> New Category
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading service categories: {error.toString()}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Services Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <span className="text-2xl font-bold text-blue-700">{stats.categories}</span>
                <span className="text-xs text-blue-600">Categories</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <span className="text-2xl font-bold text-purple-700">{stats.subcategories}</span>
                <span className="text-xs text-purple-600">Subcategories</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                <span className="text-2xl font-bold text-emerald-700">{stats.services}</span>
                <span className="text-xs text-emerald-600">Services</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground" 
                onClick={() => setActiveTab('browse')}
              >
                <Database className="h-4 w-4 mr-2" /> Manage Categories
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground" 
                onClick={() => setActiveTab('import')}
              >
                <FileUp className="h-4 w-4 mr-2" /> Import Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground" 
                onClick={handleAnalytics}
              >
                <Clipboard className="h-4 w-4 mr-2" /> Services Report
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground" 
                onClick={handleCopyToClipboard}
              >
                <Clipboard className="h-4 w-4 mr-2" /> Copy JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-card">
                <TabsTrigger value="browse" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-esm-blue-500">
                  Categories
                </TabsTrigger>
                <TabsTrigger value="edit" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-esm-blue-500">
                  {selectedCategory?.id ? 'Edit' : 'New'} Category
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-esm-blue-500">
                  Reports
                </TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="browse" className="m-0">
                  {isLoading ? (
                    <div className="text-center py-10">Loading service categories...</div>
                  ) : (
                    <ServiceCategoryList 
                      categories={categories || []} 
                      onSelectCategory={handleSelectCategory}
                      onDeleteCategory={(id) => deleteCategory.mutate(id)}
                      selectedCategory={selectedCategory}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="edit" className="m-0">
                  <ServiceCategoryEditor 
                    category={selectedCategory}
                    onSave={handleSaveCategory}
                    onCancel={() => {
                      setSelectedCategory(null);
                      setActiveTab('browse');
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="import" className="m-0">
                  <div className="space-y-6">
                    <ServiceBulkImport 
                      onImportComplete={() => {
                        queryClient.invalidateQueries({ queryKey: ['serviceHierarchy'] });
                        setActiveTab('browse');
                      }}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="m-0">
                  <Tabs defaultValue="overview">
                    <TabsList className="mb-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                      <ServiceAnalytics categories={categories || []} />
                    </TabsContent>
                    <TabsContent value="pricing">
                      <ServicesPriceReport categories={categories || []} />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
