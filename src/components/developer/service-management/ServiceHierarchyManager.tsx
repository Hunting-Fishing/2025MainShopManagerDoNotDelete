
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { ServiceMainCategory, ServiceHierarchyState } from '@/types/serviceHierarchy';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Upload, Plus, PencilIcon, Trash2Icon } from 'lucide-react';
import ServiceHierarchyBrowser from './ServiceHierarchyBrowser';
import ServiceEditor from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import ServiceBulkImport from './ServiceBulkImport';
import { exportToExcel, parseExcelFile } from '@/lib/services/excelParser';
import { v4 as uuidv4 } from 'uuid';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory, bulkImportServiceCategories } from '@/lib/services/serviceApi';

const ServiceHierarchyManager: React.FC = () => {
  const [state, setState] = useState<ServiceHierarchyState>({
    categories: [],
    isLoading: true,
    error: null
  });

  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bulkImportVisible, setBulkImportVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Fetch categories from the API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const categories = await fetchServiceCategories();
        setState({ categories, isLoading: false, error: null });
      } catch (error) {
        console.error('Error loading service categories:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to load service categories'
        }));
        toast({
          title: "Error",
          description: "Failed to load service categories",
          variant: "destructive"
        });
      }
    };
    
    loadCategories();
  }, []);

  const handleCategorySelect = (category: ServiceMainCategory | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedJob(null);
  };

  const handleSubcategorySelect = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setSelectedJob(null);
  };

  const handleJobSelect = (job: any) => {
    setSelectedJob(job);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (data: any) => {
    try {
      let updatedCategories = [...state.categories];
      let updatedCategory: ServiceMainCategory;
      
      // Handle saving job
      if (selectedJob) {
        updatedCategory = { ...selectedCategory! };
        const categoryIndex = updatedCategories.findIndex(c => c.id === updatedCategory.id);
        const subcategoryIndex = updatedCategory.subcategories.findIndex(s => s.id === selectedSubcategory.id);
        const jobIndex = updatedCategory.subcategories[subcategoryIndex].jobs.findIndex(j => j.id === selectedJob.id);
        
        updatedCategory.subcategories[subcategoryIndex].jobs[jobIndex] = {
          ...selectedJob,
          name: data.name,
          description: data.description || '',
          price: data.price !== undefined ? data.price : selectedJob.price,
          estimatedTime: data.estimatedTime !== undefined ? data.estimatedTime : selectedJob.estimatedTime
        };
      } 
      // Handle saving subcategory
      else if (selectedSubcategory) {
        updatedCategory = { ...selectedCategory! };
        const categoryIndex = updatedCategories.findIndex(c => c.id === updatedCategory.id);
        const subcategoryIndex = updatedCategory.subcategories.findIndex(s => s.id === selectedSubcategory.id);
        
        updatedCategory.subcategories[subcategoryIndex] = {
          ...selectedSubcategory,
          name: data.name,
          description: data.description || ''
        };
      } 
      // Handle saving category
      else if (selectedCategory) {
        updatedCategory = {
          ...selectedCategory,
          name: data.name,
          description: data.description || ''
        };
      } 
      // Handle adding new category
      else {
        updatedCategory = {
          id: uuidv4(),
          name: data.name,
          description: data.description || '',
          subcategories: [],
          position: updatedCategories.length
        };
      }
      
      // Save to API
      const savedCategory = await saveServiceCategory(updatedCategory);
      
      if (selectedCategory) {
        // Update existing category
        const categoryIndex = updatedCategories.findIndex(c => c.id === updatedCategory.id);
        if (categoryIndex >= 0) {
          updatedCategories[categoryIndex] = savedCategory;
        }
      } else {
        // Add new category
        updatedCategories.push(savedCategory);
      }
      
      setState({ ...state, categories: updatedCategories });
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: `Service ${selectedJob ? "job" : selectedSubcategory ? "subcategory" : "category"} saved successfully`,
      });
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive"
      });
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedJob(null);
    setIsEditing(true);
  };

  const handleAddSubcategory = () => {
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a category first",
        variant: "destructive"
      });
      return;
    }

    setSelectedSubcategory(null);
    setSelectedJob(null);
    setIsEditing(true);
  };

  const handleAddJob = () => {
    if (!selectedSubcategory) {
      toast({
        title: "Error",
        description: "Please select a subcategory first",
        variant: "destructive"
      });
      return;
    }

    setSelectedJob(null);
    setIsEditing(true);
  };

  const handleDeleteService = async () => {
    try {
      if (selectedJob) {
        // Delete job
        const updatedCategory = { ...selectedCategory! };
        const subcategoryIndex = updatedCategory.subcategories.findIndex(s => s.id === selectedSubcategory.id);
        const jobIndex = updatedCategory.subcategories[subcategoryIndex].jobs.findIndex(j => j.id === selectedJob.id);
        
        updatedCategory.subcategories[subcategoryIndex].jobs.splice(jobIndex, 1);
        
        await saveServiceCategory(updatedCategory);
        
        const updatedCategories = state.categories.map(c => 
          c.id === updatedCategory.id ? updatedCategory : c
        );
        
        setState({ ...state, categories: updatedCategories });
        setSelectedJob(null);
        toast({ title: "Success", description: "Service job deleted successfully" });
      } else if (selectedSubcategory) {
        // Delete subcategory
        const updatedCategory = { ...selectedCategory! };
        const subcategoryIndex = updatedCategory.subcategories.findIndex(s => s.id === selectedSubcategory.id);
        
        updatedCategory.subcategories.splice(subcategoryIndex, 1);
        
        await saveServiceCategory(updatedCategory);
        
        const updatedCategories = state.categories.map(c => 
          c.id === updatedCategory.id ? updatedCategory : c
        );
        
        setState({ ...state, categories: updatedCategories });
        setSelectedSubcategory(null);
        toast({ title: "Success", description: "Subcategory deleted successfully" });
      } else if (selectedCategory) {
        // Delete category
        await deleteServiceCategory(selectedCategory.id);
        
        const updatedCategories = state.categories.filter(c => c.id !== selectedCategory.id);
        
        setState({ ...state, categories: updatedCategories });
        setSelectedCategory(null);
        toast({ title: "Success", description: "Category deleted successfully" });
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive"
      });
    }
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(state.categories, 'service-hierarchy-export');
      toast({ title: "Success", description: "Services exported successfully" });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Export Error",
        description: "Failed to export services to Excel",
        variant: "destructive"
      });
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      setBulkImportVisible(true);
      
      // Parse the Excel file
      const parsedCategories = await parseExcelFile(file);
      
      // Import the services to the database
      await bulkImportServiceCategories(parsedCategories, (progress) => {
        setUploadProgress(progress * 100);
      });
      
      // Reload the categories
      const updatedCategories = await fetchServiceCategories();
      setState({ categories: updatedCategories, isLoading: false, error: null });
      
      setUploadProgress(100);
      toast({ title: "Success", description: "Services imported successfully" });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import services",
        variant: "destructive"
      });
    } finally {
      // Hide the bulk import dialog after a delay
      setTimeout(() => {
        setBulkImportVisible(false);
        setUploadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" /> Export to Excel
          </Button>
          <label htmlFor="import-excel" className="cursor-pointer">
            <Button variant="outline" as="span">
              <Upload className="w-4 h-4 mr-2" /> Import Excel
            </Button>
            <input 
              id="import-excel"
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      <Tabs defaultValue="browse">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse Services</TabsTrigger>
          <TabsTrigger value="analytics">Service Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Price Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Service Categories</CardTitle>
                    <Button size="sm" variant="outline" onClick={handleAddCategory}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ServiceHierarchyBrowser 
                    categories={state.categories}
                    selectedCategory={selectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    selectedJob={selectedJob}
                    onSelectCategory={handleCategorySelect}
                    onSelectSubcategory={handleSubcategorySelect}
                    onSelectJob={handleJobSelect}
                    isLoading={state.isLoading}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {!isEditing ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>
                        {selectedJob ? 'Service Details' : 
                         selectedSubcategory ? 'Subcategory Details' : 
                         selectedCategory ? 'Category Details' : 
                         'Service Management'}
                      </CardTitle>
                      <div className="flex gap-2">
                        {(selectedCategory || selectedSubcategory || selectedJob) && (
                          <>
                            <Button size="sm" variant="default" onClick={handleStartEdit}>
                              <PencilIcon className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2Icon className="w-4 h-4 mr-1" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the 
                                    {selectedJob ? ' service.' : selectedSubcategory ? ' subcategory and all its services.' : ' category, subcategories, and services.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteService}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        {selectedCategory && !selectedSubcategory && (
                          <Button size="sm" variant="outline" onClick={handleAddSubcategory}>
                            <Plus className="w-4 h-4 mr-1" /> Add Subcategory
                          </Button>
                        )}
                        {selectedSubcategory && (
                          <Button size="sm" variant="outline" onClick={handleAddJob}>
                            <Plus className="w-4 h-4 mr-1" /> Add Service
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedJob ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">Name</h3>
                          <p>{selectedJob.name}</p>
                        </div>
                        {selectedJob.description && (
                          <div>
                            <h3 className="font-medium">Description</h3>
                            <p>{selectedJob.description}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium">Price</h3>
                            <p>${selectedJob.price?.toFixed(2) || 'N/A'}</p>
                          </div>
                          <div>
                            <h3 className="font-medium">Estimated Time</h3>
                            <p>{selectedJob.estimatedTime || 'N/A'} minutes</p>
                          </div>
                        </div>
                      </div>
                    ) : selectedSubcategory ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">Name</h3>
                          <p>{selectedSubcategory.name}</p>
                        </div>
                        {selectedSubcategory.description && (
                          <div>
                            <h3 className="font-medium">Description</h3>
                            <p>{selectedSubcategory.description}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">Services</h3>
                          <p>{selectedSubcategory.jobs?.length || 0} services</p>
                        </div>
                      </div>
                    ) : selectedCategory ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">Name</h3>
                          <p>{selectedCategory.name}</p>
                        </div>
                        {selectedCategory.description && (
                          <div>
                            <h3 className="font-medium">Description</h3>
                            <p>{selectedCategory.description}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">Subcategories</h3>
                          <p>{selectedCategory.subcategories?.length || 0} subcategories</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Select a category, subcategory, or service to view its details</p>
                        <p className="mt-2">Or add a new category to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <ServiceEditor 
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  selectedJob={selectedJob}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <ServiceAnalytics categories={state.categories} />
        </TabsContent>
        
        <TabsContent value="pricing">
          <ServicesPriceReport categories={state.categories} />
        </TabsContent>
      </Tabs>

      {bulkImportVisible && (
        <ServiceBulkImport 
          progress={uploadProgress} 
          onCancel={() => setBulkImportVisible(false)} 
        />
      )}
    </div>
  );
};

export default ServiceHierarchyManager;
