
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/hooks/use-toast";
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from '@/types/serviceHierarchy';
import { 
  fetchServiceCategories, 
  saveServiceCategory, 
  deleteServiceCategory, 
  bulkImportServiceCategories 
} from '@/lib/services/serviceApi';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { ServiceEditor } from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertCircle, Download, LayoutGrid, LineChart, Plus, Upload } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEmptyCategory, createEmptySubcategory, createEmptyJob, sortCategoriesByPosition } from '@/lib/services/serviceUtils';
import ServiceBulkImport from './ServiceBulkImport';
import { parseExcelData, exportToExcel } from '@/lib/services/excelParser';
import ServicesPriceReport from './ServicesPriceReport';

export const ServiceHierarchyManager = () => {
  const queryClient = useQueryClient();
  
  // Selected items state
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [activeTab, setActiveTab] = useState("services");
  const [importError, setImportError] = useState<string | null>(null);
  
  // Queries and Mutations
  const { 
    data: categories = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: fetchServiceCategories
  });

  // Sort categories by position
  const sortedCategories = sortCategoriesByPosition([...categories]);
  
  // Save mutations
  const saveServiceMutation = useMutation({
    mutationFn: saveServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive" 
      });
    }
  });

  // Delete mutations
  const deleteServiceMutation = useMutation({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      // Clear selections if the deleted item was selected
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSelectedJob(null);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive" 
      });
    }
  });

  // Import mutation
  const importServicesMutation = useMutation({
    mutationFn: (categories: ServiceMainCategory[]) => bulkImportServiceCategories(categories),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      toast({ 
        title: "Import Complete", 
        description: "Services have been successfully imported.",
      });
      setImportError(null);
    },
    onError: (error) => {
      toast({ 
        title: "Import Failed", 
        description: `Error importing services: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive" 
      });
    }
  });
  
  // Selection Handlers
  const handleCategorySelect = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedJob(null);
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory, category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedJob(null);
  };

  const handleJobSelect = (job: ServiceJob, subcategory: ServiceSubcategory, category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedJob(job);
  };

  // Create new handlers
  const handleAddCategory = () => {
    // Create a new category with position at the end
    const newPosition = sortedCategories.length > 0 
      ? Math.max(...sortedCategories.map(c => c.position || 0)) + 1 
      : 0;
    
    const newCategory = createEmptyCategory(newPosition);
    setSelectedCategory(newCategory);
    setSelectedSubcategory(null);
    setSelectedJob(null);
    
    // No server saving is done here - will be saved when the user edits and saves
  };

  const handleAddSubcategory = () => {
    if (!selectedCategory) return;
    
    const newSubcategory = createEmptySubcategory();
    
    // Update the local state first
    const updatedCategory = {
      ...selectedCategory,
      subcategories: [...selectedCategory.subcategories, newSubcategory]
    };
    
    // Save to server
    saveServiceMutation.mutate(updatedCategory);
    
    // Update UI state
    setSelectedCategory(updatedCategory);
    setSelectedSubcategory(newSubcategory);
    setSelectedJob(null);
  };

  const handleAddJob = () => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    const newJob = createEmptyJob();
    
    // Find the subcategory and update it with the new job
    const updatedSubcategories = selectedCategory.subcategories.map(sub => {
      if (sub.id === selectedSubcategory.id) {
        return {
          ...sub,
          jobs: [...sub.jobs, newJob]
        };
      }
      return sub;
    });
    
    // Update the category with the modified subcategories
    const updatedCategory = {
      ...selectedCategory,
      subcategories: updatedSubcategories
    };
    
    // Save to server
    saveServiceMutation.mutate(updatedCategory);
    
    // Update the local state
    const updatedSubcategory = updatedSubcategories.find(sub => sub.id === selectedSubcategory.id);
    
    setSelectedCategory(updatedCategory);
    
    if (updatedSubcategory) {
      setSelectedSubcategory(updatedSubcategory);
      setSelectedJob(newJob);
    }
  };

  // Delete handlers
  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category and all its subcategories and services?")) {
      deleteServiceMutation.mutate(categoryId);
    }
  };

  // Save handler for edits
  const handleSave = (
    editedCategory: ServiceMainCategory | null,
    editedSubcategory: ServiceSubcategory | null,
    editedJob: ServiceJob | null
  ) => {
    if (!editedCategory) return;
    
    // Create a copy of the edited category
    let updatedCategory = { ...editedCategory };
    
    // If we're editing a subcategory or job, we need to find and update them
    if (editedSubcategory) {
      updatedCategory.subcategories = updatedCategory.subcategories.map(sub => 
        sub.id === editedSubcategory.id ? editedSubcategory : sub
      );
      
      if (editedJob) {
        const updatedSubcategory = updatedCategory.subcategories.find(
          sub => sub.id === editedSubcategory.id
        );
        
        if (updatedSubcategory) {
          updatedSubcategory.jobs = updatedSubcategory.jobs.map(job => 
            job.id === editedJob.id ? editedJob : job
          );
        }
      }
    }
    
    // Save to server
    saveServiceMutation.mutate(updatedCategory);
    
    // Update local state
    setSelectedCategory(updatedCategory);
    setSelectedSubcategory(editedSubcategory);
    setSelectedJob(editedJob);
  };

  // Cancel edit handler
  const handleCancelEdit = () => {
    // If there's a new category that hasn't been saved, remove it
    if (selectedCategory && !sortedCategories.find(c => c.id === selectedCategory.id)) {
      setSelectedCategory(null);
    }
    
    // Reset selection to refresh from server data
    const categoryFromServer = selectedCategory 
      ? sortedCategories.find(c => c.id === selectedCategory.id) 
      : null;
    
    let subcategoryFromServer = null;
    let jobFromServer = null;
    
    if (categoryFromServer && selectedSubcategory) {
      subcategoryFromServer = categoryFromServer.subcategories.find(
        s => s.id === selectedSubcategory.id
      );
      
      if (subcategoryFromServer && selectedJob) {
        jobFromServer = subcategoryFromServer.jobs.find(j => j.id === selectedJob.id);
      }
    }
    
    setSelectedCategory(categoryFromServer);
    setSelectedSubcategory(subcategoryFromServer);
    setSelectedJob(jobFromServer);
  };

  // Import/Export handlers
  const handleFileUpload = async (file: File) => {
    try {
      setImportError(null);
      const parsedCategories = await parseExcelData(file);
      
      if (parsedCategories.length === 0) {
        setImportError("No valid service data found in file.");
        return;
      }
      
      importServicesMutation.mutate(parsedCategories);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      setImportError(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportData = () => {
    exportToExcel(sortedCategories, 'services-export');
    toast({
      title: "Export Complete",
      description: "Services have been exported to Excel."
    });
  };

  // Check if there are no categories to show the empty state
  const isEmptyState = sortedCategories.length === 0 && !isLoading;

  return (
    <div className="flex flex-col space-y-4 px-4 py-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service Management</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="flex items-center"
            onClick={handleExportData}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export Services
          </Button>
          
          <Button 
            onClick={handleAddCategory}
            className="bg-green-600 hover:bg-green-700 flex items-center"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="services" className="flex items-center">
            <LayoutGrid className="mr-1.5 h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <LineChart className="mr-1.5 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="space-y-4">
          {importError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading services...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading services: {error instanceof Error ? error.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
                    <CardTitle className="text-lg">Service Hierarchy</CardTitle>
                    <div className="flex space-x-2">
                      {selectedCategory && (
                        <Button 
                          size="sm"
                          onClick={handleAddSubcategory}
                          className="text-xs h-8 px-2 bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add Subcategory
                        </Button>
                      )}
                      
                      {selectedSubcategory && (
                        <Button 
                          size="sm"
                          onClick={handleAddJob}
                          className="text-xs h-8 px-2 bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add Service
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    {isEmptyState ? (
                      <div className="p-4 text-center">
                        <p className="text-gray-500 mb-4">No services found. Get started by adding categories or importing services.</p>
                        <ServiceBulkImport 
                          onFileUpload={handleFileUpload}
                          isLoading={importServicesMutation.isPending}
                        />
                      </div>
                    ) : (
                      <div className="p-4">
                        <ServiceBulkImport 
                          onFileUpload={handleFileUpload}
                          isLoading={importServicesMutation.isPending}
                        />
                        
                        <div className="mt-4">
                          <ServiceHierarchyBrowser
                            categories={sortedCategories}
                            selectedCategory={selectedCategory}
                            selectedSubcategory={selectedSubcategory}
                            selectedJob={selectedJob}
                            onCategorySelect={handleCategorySelect}
                            onSubcategorySelect={handleSubcategorySelect}
                            onJobSelect={handleJobSelect}
                            onCategoryDelete={handleDeleteCategory}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <ServiceEditor
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  selectedJob={selectedJob}
                  onSave={handleSave}
                  onCancel={handleCancelEdit}
                />
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ServiceAnalytics categories={sortedCategories} />
            <ServicesPriceReport categories={sortedCategories} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceHierarchyManager;
