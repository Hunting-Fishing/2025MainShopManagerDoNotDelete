
import React, { useState, useCallback, useEffect } from 'react';
import { Grid, Container } from "semantic-ui-react";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Upload, Plus, PencilIcon, Trash2Icon } from 'lucide-react';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import ServiceEditor from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import ServiceBulkImport from './ServiceBulkImport';
import { exportToExcel } from '@/lib/services/excelParser';
import { v4 as uuidv4 } from 'uuid';
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from '@/types/serviceHierarchy';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';

// Main component for managing the service hierarchy
const ServiceHierarchyManager: React.FC = () => {
  // State for service categories and selected items
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected items state
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  
  // UI state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showBulkImport, setShowBulkImport] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('browse');

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Function to load categories from API
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchServiceCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load service categories:", err);
      setError("Failed to load service categories. Please try again later.");
      toast.error("Failed to load service categories");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for category selection
  const handleCategorySelect = useCallback((category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedJob(null);
  }, []);
  
  // Handler for subcategory selection
  const handleSubcategorySelect = useCallback((subcategory: ServiceSubcategory, category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedJob(null);
  }, []);
  
  // Handler for job selection
  const handleJobSelect = useCallback((job: ServiceJob, subcategory: ServiceSubcategory, category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedJob(job);
  }, []);
  
  // Handler for adding a new category
  const handleAddCategory = useCallback(() => {
    // Create a new category with a unique ID
    const newCategory: ServiceMainCategory = {
      id: uuidv4(),
      name: 'New Category',
      description: '',
      position: categories.length,
      subcategories: [{
        id: uuidv4(),
        name: 'New Subcategory',
        description: '',
        jobs: [{
          id: uuidv4(),
          name: 'New Service',
          description: '',
          estimatedTime: 30,
          price: 0
        }]
      }]
    };
    
    // Add the new category to the state
    setCategories([...categories, newCategory]);
    
    // Select the new category
    setSelectedCategory(newCategory);
    setSelectedSubcategory(null);
    setSelectedJob(null);

    // Save to database
    saveCategory(newCategory);
    
    // Show toast notification
    toast.success('New category added');
  }, [categories]);
  
  // Handler for adding a new subcategory
  const handleAddSubcategory = useCallback(() => {
    if (!selectedCategory) return;
    
    // Create a new subcategory with a unique ID
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: 'New Subcategory',
      description: '',
      jobs: [{
        id: uuidv4(),
        name: 'New Service',
        description: '',
        estimatedTime: 30,
        price: 0
      }]
    };
    
    // Create a new version of the selected category with the new subcategory
    const updatedCategory = {
      ...selectedCategory,
      subcategories: [...selectedCategory.subcategories, newSubcategory]
    };
    
    // Update the categories state
    const updatedCategories = categories.map(cat => 
      cat.id === selectedCategory.id ? updatedCategory : cat
    );
    
    setCategories(updatedCategories);
    
    // Select the new subcategory
    setSelectedCategory(updatedCategory);
    setSelectedSubcategory(newSubcategory);
    setSelectedJob(null);

    // Save to database
    saveCategory(updatedCategory);
    
    // Show toast notification
    toast.success('New subcategory added');
  }, [categories, selectedCategory]);
  
  // Handler for adding a new job
  const handleAddJob = useCallback(() => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    // Create a new job with a unique ID
    const newJob: ServiceJob = {
      id: uuidv4(),
      name: 'New Service',
      description: '',
      estimatedTime: 30,
      price: 0
    };
    
    // Find the selected subcategory and add the new job
    const updatedSubcategory = {
      ...selectedSubcategory,
      jobs: [...selectedSubcategory.jobs, newJob]
    };
    
    // Update the selected category with the updated subcategory
    const updatedCategory = {
      ...selectedCategory,
      subcategories: selectedCategory.subcategories.map(sub => 
        sub.id === selectedSubcategory.id ? updatedSubcategory : sub
      )
    };
    
    // Update the categories state
    const updatedCategories = categories.map(cat => 
      cat.id === selectedCategory.id ? updatedCategory : cat
    );
    
    setCategories(updatedCategories);
    
    // Select the new job
    setSelectedCategory(updatedCategory);
    setSelectedSubcategory(updatedSubcategory);
    setSelectedJob(newJob);

    // Save to database
    saveCategory(updatedCategory);
    
    // Show toast notification
    toast.success('New service added');
  }, [categories, selectedCategory, selectedSubcategory]);
  
  // Handler for saving edited items
  const handleSave = useCallback(async (data: any) => {
    if (!selectedCategory) return;
    
    let updatedCategory = { ...selectedCategory };
    
    // Update the appropriate item based on what was selected
    if (selectedJob && selectedSubcategory) {
      // Update job
      const updatedJob = { ...selectedJob, ...data };
      
      // Update subcategory with updated job
      const updatedSubcategory = {
        ...selectedSubcategory,
        jobs: selectedSubcategory.jobs.map(job => 
          job.id === selectedJob.id ? updatedJob : job
        )
      };
      
      // Update category with updated subcategory
      updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories.map(sub => 
          sub.id === selectedSubcategory.id ? updatedSubcategory : sub
        )
      };
      
      // Update selected items
      setSelectedJob(updatedJob);
      setSelectedSubcategory(updatedSubcategory);
    } else if (selectedSubcategory) {
      // Update subcategory
      const updatedSubcategory = { ...selectedSubcategory, ...data };
      
      // Update category with updated subcategory
      updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories.map(sub => 
          sub.id === selectedSubcategory.id ? updatedSubcategory : sub
        )
      };
      
      // Update selected items
      setSelectedSubcategory(updatedSubcategory);
    } else {
      // Update category
      updatedCategory = { ...selectedCategory, ...data };
    }
    
    // Update categories state
    const updatedCategories = categories.map(cat => 
      cat.id === selectedCategory.id ? updatedCategory : cat
    );
    
    setCategories(updatedCategories);
    setSelectedCategory(updatedCategory);

    // Save to database
    try {
      await saveCategory(updatedCategory);
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes');
    }
  }, [categories, selectedCategory, selectedSubcategory, selectedJob]);

  // Handler for deleting the currently selected category
  const handleDeleteCategory = useCallback(async () => {
    if (!selectedCategory) return;
    
    try {
      // Delete from database first
      await deleteServiceCategory(selectedCategory.id);
      
      // Update state if successful
      const updatedCategories = categories.filter(cat => cat.id !== selectedCategory.id);
      setCategories(updatedCategories);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSelectedJob(null);
      
      // Close the confirm dialog and show a success toast
      setShowDeleteConfirm(false);
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  }, [categories, selectedCategory]);

  // Function to save a category to the database
  const saveCategory = async (category: ServiceMainCategory) => {
    try {
      await saveServiceCategory(category);
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  };

  // Handler for exporting services to Excel
  const handleExport = useCallback(() => {
    try {
      exportToExcel(categories, 'services-export');
      toast.success('Services exported successfully');
    } catch (error) {
      console.error('Failed to export services:', error);
      toast.error('Failed to export services');
    }
  }, [categories]);

  // Handler for cancelling bulk import
  const handleCancelImport = useCallback(() => {
    setShowBulkImport(false);
    setImportProgress(0);
  }, []);

  // Handler for completing bulk import
  const handleImportComplete = useCallback((importedCategories: ServiceMainCategory[]) => {
    setCategories(importedCategories);
    setShowBulkImport(false);
    setImportProgress(0);
    toast.success('Services imported successfully');
  }, []);

  // Disable editing if there's nothing selected
  const isEditorDisabled = !selectedCategory;

  return (
    <Container fluid className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Service Management</h1>
          <p className="text-gray-500">Manage service categories, subcategories, and service items</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Services
          </Button>
          
          <AlertDialog open={showBulkImport} onOpenChange={setShowBulkImport}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Services
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Import Services from Excel</AlertDialogTitle>
                <AlertDialogDescription>
                  Upload an Excel file containing service data. The file should have columns for category, subcategory, service, price, time, and description.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <ServiceBulkImport 
                onCancel={handleCancelImport} 
                onComplete={handleImportComplete} 
              />
            </AlertDialogContent>
          </AlertDialog>
          
          <Button onClick={handleAddCategory}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse Services</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <Grid>
            <Grid.Row>
              <Grid.Column width={8}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Service Hierarchy</h2>
                    <div className="space-x-2">
                      {selectedCategory && (
                        <>
                          <Button variant="ghost" size="sm" onClick={handleAddSubcategory}>
                            Add Subcategory
                          </Button>
                          {selectedSubcategory && (
                            <Button variant="ghost" size="sm" onClick={handleAddJob}>
                              Add Service
                            </Button>
                          )}
                          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                <Trash2Icon className="h-4 w-4 mr-1" />
                                Delete Category
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the category "{selectedCategory.name}"?
                                  This action cannot be undone and will remove all subcategories and services within this category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Button variant="destructive" onClick={handleDeleteCategory}>
                                  Delete
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <p className="text-gray-500">Loading services...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 text-red-800 p-4 rounded-md">
                      <p>{error}</p>
                      <Button variant="outline" className="mt-2" onClick={loadCategories}>
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <ServiceHierarchyBrowser
                      categories={categories}
                      selectedCategory={selectedCategory}
                      selectedSubcategory={selectedSubcategory}
                      selectedJob={selectedJob}
                      onCategorySelect={handleCategorySelect}
                      onSubcategorySelect={handleSubcategorySelect}
                      onJobSelect={handleJobSelect}
                      onCategoryDelete={handleDeleteCategory}
                    />
                  )}
                </div>
              </Grid.Column>
              
              <Grid.Column width={8}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h2 className="text-xl font-semibold mb-4">
                    {isEditorDisabled ? 'Service Editor' : 'Edit Service'}
                  </h2>
                  
                  <ServiceEditor
                    selectedCategory={selectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    selectedJob={selectedJob}
                    onSave={handleSave}
                    onCancel={() => {}}
                  />
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <ServiceAnalytics categories={categories} />
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <ServicesPriceReport categories={categories} />
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default ServiceHierarchyManager;
