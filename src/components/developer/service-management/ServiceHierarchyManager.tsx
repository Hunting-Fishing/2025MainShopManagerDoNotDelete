
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory, bulkImportServiceCategories } from '@/lib/services/serviceApi';
import { createEmptyCategory, deepClone, sortCategoriesByPosition } from '@/lib/services/serviceUtils';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import ServiceEditor from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import ServiceBulkImport from './ServiceBulkImport';
import { writeExcelFile } from '@/lib/services/excelParser';
import { v4 as uuidv4 } from 'uuid';
import { handleApiError } from '@/utils/errorHandling';

export default function ServiceHierarchyManager() {
  const queryClient = useQueryClient();
  
  // States for selection and editing
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Query and mutations
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: fetchServiceCategories,
  });

  const sortedCategories = sortCategoriesByPosition([...categories]);
  
  const createMutation = useMutation({
    mutationFn: saveServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      toast({
        title: "Success",
        description: "Service hierarchy updated successfully",
      });
      clearSelection();
    },
    onError: (error: any) => {
      handleApiError(error, "Failed to save service data");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      clearSelection();
    },
    onError: (error: any) => {
      handleApiError(error, "Failed to delete item");
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: (data: ServiceMainCategory[]) => bulkImportServiceCategories(
      data,
      (progress: number) => {
        console.log(`Import progress: ${Math.round(progress * 100)}%`);
      }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      toast({
        title: "Success",
        description: "Services imported successfully",
      });
      setIsImporting(false);
    },
    onError: (error: any) => {
      handleApiError(error, "Failed to import services");
      setIsImporting(false);
    }
  });

  // Selection handlers
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

  // Clear selection
  const clearSelection = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedJob(null);
    setIsEditing(false);
  };

  // Delete handlers
  const handleCategoryDelete = (categoryId: string) => {
    // First check if this was the selected category
    if (selectedCategory?.id === categoryId) {
      clearSelection();
    }
    deleteMutation.mutate(categoryId);
  };

  // Handlers for adding new items
  const handleAddCategory = () => {
    clearSelection();
    // Create a new category with the next position
    const nextPosition = categories.length > 0 
      ? Math.max(...categories.map(c => c.position || 0)) + 1 
      : 0;
    setIsEditing(true);
  };

  const handleAddSubcategory = () => {
    if (!selectedCategory) return;
    setSelectedSubcategory(null);
    setSelectedJob(null);
    setIsEditing(true);
  };

  const handleAddJob = () => {
    if (!selectedSubcategory) return;
    setSelectedJob(null);
    setIsEditing(true);
  };

  // Edit handlers
  const handleEditItem = () => {
    setIsEditing(true);
  };

  // Save handler
  const handleSave = (formData: any) => {
    if (selectedJob) {
      // Update job
      const updatedCategory = deepClone(selectedCategory);
      if (!updatedCategory) return;
      
      const subcategoryIndex = updatedCategory.subcategories.findIndex(
        sub => sub.id === selectedSubcategory?.id
      );
      if (subcategoryIndex === -1) return;
      
      const jobIndex = updatedCategory.subcategories[subcategoryIndex].jobs.findIndex(
        job => job.id === selectedJob.id
      );
      if (jobIndex === -1) return;

      updatedCategory.subcategories[subcategoryIndex].jobs[jobIndex] = {
        ...selectedJob,
        ...formData,
      };
      
      createMutation.mutate(updatedCategory);
    } else if (selectedSubcategory) {
      // Update subcategory
      const updatedCategory = deepClone(selectedCategory);
      if (!updatedCategory) return;
      
      const subcategoryIndex = updatedCategory.subcategories.findIndex(
        sub => sub.id === selectedSubcategory.id
      );
      if (subcategoryIndex === -1) return;
      
      updatedCategory.subcategories[subcategoryIndex] = {
        ...selectedSubcategory,
        ...formData,
      };
      
      createMutation.mutate(updatedCategory);
    } else if (selectedCategory) {
      // Update category
      const updatedCategory = {
        ...selectedCategory,
        ...formData,
      };
      
      createMutation.mutate(updatedCategory);
    } else {
      // Add new category
      const nextPosition = categories.length > 0 
        ? Math.max(...categories.map(c => c.position || 0)) + 1 
        : 0;
      
      const newCategory: ServiceMainCategory = {
        id: uuidv4(),
        name: formData.name,
        description: formData.description,
        position: nextPosition,
        subcategories: [],
      };
      
      createMutation.mutate(newCategory);
    }
    
    setIsEditing(false);
  };

  // File upload handler
  const handleFileUpload = async (file: File) => {
    try {
      setIsImporting(true);
      const data = await readFileAsJson(file);
      if (Array.isArray(data) && data.length > 0) {
        bulkImportMutation.mutate(data);
      } else {
        toast({
          title: "Error",
          description: "Invalid file format or empty data",
          variant: "destructive",
        });
        setIsImporting(false);
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Error",
        description: "Failed to process the uploaded file",
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  const readFileAsJson = async (file: File): Promise<ServiceMainCategory[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Parse Excel file using the imported function
          const result = await import('@/lib/services/excelParser').then(
            module => module.parseExcelFile(file)
          );
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (e) => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle export
  const handleExportData = async () => {
    try {
      await writeExcelFile(categories);
      toast({
        title: "Success",
        description: "Services exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export services",
        variant: "destructive",
      });
    }
  };

  // Reset state when loading changes
  useEffect(() => {
    if (!isLoading) {
      // Reset selection if the selected items no longer exist
      if (selectedCategory) {
        const categoryExists = categories.some(c => c.id === selectedCategory.id);
        if (!categoryExists) {
          clearSelection();
        }
      }
    }
  }, [isLoading, categories]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Service Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error loading the service hierarchy. Please try again later.</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Service Management</h1>
        <div className="flex space-x-2">
          <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <ServiceBulkImport onFileUpload={handleFileUpload} isLoading={isImporting} />
        </div>
      </div>

      <Tabs defaultValue="hierarchy" className="w-full">
        <TabsList>
          <TabsTrigger value="hierarchy">Service Hierarchy</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Report</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Panel - Service Hierarchy Browser */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle>Services</CardTitle>
                  <Button onClick={handleAddCategory} size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Category
                  </Button>
                </CardHeader>
                <CardContent>
                  <ServiceHierarchyBrowser 
                    categories={sortedCategories}
                    selectedCategory={selectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    selectedJob={selectedJob}
                    onCategorySelect={handleCategorySelect}
                    onSubcategorySelect={handleSubcategorySelect}
                    onJobSelect={handleJobSelect}
                    onCategoryDelete={handleCategoryDelete}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Editor or Details */}
            <div className="md:col-span-2">
              {isEditing ? (
                <ServiceEditor
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  selectedJob={selectedJob}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>
                        {selectedJob 
                          ? 'Service Details' 
                          : selectedSubcategory 
                            ? 'Subcategory Details' 
                            : selectedCategory 
                              ? 'Category Details' 
                              : 'Service Details'
                        }
                      </CardTitle>
                      <div className="flex space-x-2">
                        {selectedCategory && !selectedSubcategory && (
                          <Button size="sm" onClick={handleAddSubcategory}>
                            <Plus className="h-4 w-4 mr-1" /> Add Subcategory
                          </Button>
                        )}
                        {selectedSubcategory && !selectedJob && (
                          <Button size="sm" onClick={handleAddJob}>
                            <Plus className="h-4 w-4 mr-1" /> Add Service
                          </Button>
                        )}
                        {(selectedCategory || selectedSubcategory || selectedJob) && (
                          <Button size="sm" onClick={handleEditItem}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedJob ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{selectedJob.name}</h3>
                          <p className="text-gray-500 text-sm">
                            {selectedCategory?.name} &gt; {selectedSubcategory?.name}
                          </p>
                        </div>
                        {selectedJob.description && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Description</h4>
                            <p>{selectedJob.description}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Price</h4>
                            <p className="text-lg font-medium">
                              {selectedJob.price ? `$${selectedJob.price.toFixed(2)}` : 'Not set'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Estimated Time</h4>
                            <p className="text-lg font-medium">
                              {selectedJob.estimatedTime ? `${selectedJob.estimatedTime} minutes` : 'Not set'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : selectedSubcategory ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{selectedSubcategory.name}</h3>
                          <p className="text-gray-500 text-sm">{selectedCategory?.name}</p>
                        </div>
                        {selectedSubcategory.description && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Description</h4>
                            <p>{selectedSubcategory.description}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Services</h4>
                          <p className="text-lg font-medium">{selectedSubcategory.jobs.length}</p>
                        </div>
                      </div>
                    ) : selectedCategory ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{selectedCategory.name}</h3>
                        </div>
                        {selectedCategory.description && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Description</h4>
                            <p>{selectedCategory.description}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Subcategories</h4>
                          <p className="text-lg font-medium">{selectedCategory.subcategories.length}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Total Services</h4>
                          <p className="text-lg font-medium">
                            {selectedCategory.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-64 items-center justify-center text-gray-500">
                        <p>Select a category, subcategory, or service to view details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="pt-4">
          <ServiceAnalytics categories={sortedCategories} />
        </TabsContent>

        <TabsContent value="pricing" className="pt-4">
          <ServicesPriceReport categories={sortedCategories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Missing component import
import { Edit } from 'lucide-react';
