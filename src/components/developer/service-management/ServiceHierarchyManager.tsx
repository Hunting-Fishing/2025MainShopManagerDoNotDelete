
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Upload, Plus, PencilIcon, Trash2Icon } from 'lucide-react';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import ServiceEditor from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import ServiceBulkImport from './ServiceBulkImport';
import { exportToExcel } from '@/lib/services/excelParser';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const ServiceHierarchyManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('browse');
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false);

  // Get selected category
  const selectedCategory = selectedCategoryId 
    ? categories.find(cat => cat.id === selectedCategoryId) || null
    : null;
    
  // Get selected subcategory
  const selectedSubcategory = selectedCategory && selectedSubcategoryId
    ? selectedCategory.subcategories.find(sub => sub.id === selectedSubcategoryId) || null
    : null;
    
  // Get selected job
  const selectedJob = selectedSubcategory && selectedJobId
    ? selectedSubcategory.jobs.find(job => job.id === selectedJobId) || null
    : null;

  // Load service categories from API
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchServiceCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error loading service categories:', err);
        setError('Failed to load services. Please try again later.');
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Handle item selection
  const handleSelectItem = (type: 'category' | 'subcategory' | 'job', id: string | null) => {
    if (type === 'category') {
      setSelectedCategoryId(id);
      setSelectedSubcategoryId(null);
      setSelectedJobId(null);
    } else if (type === 'subcategory') {
      setSelectedSubcategoryId(id);
      setSelectedJobId(null);
    } else if (type === 'job') {
      setSelectedJobId(id);
    }
  };

  // Create a new category
  const handleCreateCategory = async () => {
    const newCategory: ServiceMainCategory = {
      id: uuidv4(),
      name: 'New Category',
      description: '',
      position: categories.length,
      subcategories: []
    };

    try {
      const savedCategory = await saveServiceCategory(newCategory);
      setCategories([...categories, savedCategory]);
      setSelectedCategoryId(savedCategory.id);
      setSelectedSubcategoryId(null);
      setSelectedJobId(null);
      setActiveTab('edit');
      toast.success('Category created');
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error('Failed to create category');
    }
  };

  // Create a new subcategory
  const handleCreateSubcategory = async () => {
    if (!selectedCategory) return;

    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: 'New Subcategory',
      description: '',
      jobs: []
    };

    const updatedCategory = {
      ...selectedCategory,
      subcategories: [...selectedCategory.subcategories, newSubcategory]
    };

    try {
      const savedCategory = await saveServiceCategory(updatedCategory);
      setCategories(categories.map(cat => 
        cat.id === savedCategory.id ? savedCategory : cat
      ));
      setSelectedSubcategoryId(newSubcategory.id);
      setSelectedJobId(null);
      setActiveTab('edit');
      toast.success('Subcategory created');
    } catch (err) {
      console.error('Error creating subcategory:', err);
      toast.error('Failed to create subcategory');
    }
  };

  // Create a new job
  const handleCreateJob = async () => {
    if (!selectedCategory || !selectedSubcategory) return;

    const newJob: ServiceJob = {
      id: uuidv4(),
      name: 'New Service',
      description: '',
      estimatedTime: 0,
      price: 0
    };

    const updatedSubcategories = selectedCategory.subcategories.map(sub =>
      sub.id === selectedSubcategory.id
        ? { ...sub, jobs: [...sub.jobs, newJob] }
        : sub
    );

    const updatedCategory = {
      ...selectedCategory,
      subcategories: updatedSubcategories
    };

    try {
      const savedCategory = await saveServiceCategory(updatedCategory);
      setCategories(categories.map(cat => 
        cat.id === savedCategory.id ? savedCategory : cat
      ));
      setSelectedJobId(newJob.id);
      setActiveTab('edit');
      toast.success('Service created');
    } catch (err) {
      console.error('Error creating service:', err);
      toast.error('Failed to create service');
    }
  };

  // Save updated service item
  const handleSave = async (
    updatedCategory: ServiceMainCategory | null,
    updatedSubcategory: ServiceSubcategory | null,
    updatedJob: ServiceJob | null
  ) => {
    if (!selectedCategory) return;

    let categoryToSave = { ...selectedCategory };

    if (updatedCategory) {
      // Updating a category
      categoryToSave = {
        ...categoryToSave,
        name: updatedCategory.name,
        description: updatedCategory.description || ''
      };
    } 
    
    if (updatedSubcategory && selectedSubcategory) {
      // Updating a subcategory
      categoryToSave = {
        ...categoryToSave,
        subcategories: categoryToSave.subcategories.map(sub =>
          sub.id === selectedSubcategory.id
            ? {
                ...sub,
                name: updatedSubcategory.name,
                description: updatedSubcategory.description || ''
              }
            : sub
        )
      };
    }

    if (updatedJob && selectedSubcategoryId && selectedJob) {
      // Updating a job
      categoryToSave = {
        ...categoryToSave,
        subcategories: categoryToSave.subcategories.map(sub =>
          sub.id === selectedSubcategoryId
            ? {
                ...sub,
                jobs: sub.jobs.map(job =>
                  job.id === selectedJob.id
                    ? updatedJob
                    : job
                )
              }
            : sub
        )
      };
    }

    try {
      const savedCategory = await saveServiceCategory(categoryToSave);
      
      setCategories(categories.map(cat => 
        cat.id === savedCategory.id ? savedCategory : cat
      ));
      
      setActiveTab('browse');
      toast.success('Changes saved');
    } catch (err) {
      console.error('Error saving changes:', err);
      toast.error('Failed to save changes');
    }
  };

  // Delete service item
  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      if (selectedJobId && selectedSubcategoryId) {
        // Delete a job
        const updatedSubcategories = selectedCategory.subcategories.map(sub =>
          sub.id === selectedSubcategoryId
            ? { ...sub, jobs: sub.jobs.filter(job => job.id !== selectedJobId) }
            : sub
        );

        const updatedCategory = {
          ...selectedCategory,
          subcategories: updatedSubcategories
        };

        await saveServiceCategory(updatedCategory);
        setCategories(categories.map(cat => 
          cat.id === selectedCategory.id ? updatedCategory : cat
        ));
        setSelectedJobId(null);
        toast.success('Service deleted');
      } else if (selectedSubcategoryId) {
        // Delete a subcategory
        const updatedCategory = {
          ...selectedCategory,
          subcategories: selectedCategory.subcategories.filter(sub => 
            sub.id !== selectedSubcategoryId
          )
        };

        await saveServiceCategory(updatedCategory);
        setCategories(categories.map(cat => 
          cat.id === selectedCategory.id ? updatedCategory : cat
        ));
        setSelectedSubcategoryId(null);
        toast.success('Subcategory deleted');
      } else if (selectedCategoryId) {
        // Delete a category
        await deleteServiceCategory(selectedCategoryId);
        setCategories(categories.filter(cat => cat.id !== selectedCategoryId));
        setSelectedCategoryId(null);
        toast.success('Category deleted');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to delete');
    }
  };

  // Export services to Excel
  const handleExport = () => {
    try {
      exportToExcel(categories, 'service-catalog');
      toast.success('Service catalog exported');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export services');
    }
  };

  // Handle bulk import completion
  const handleImportComplete = (importedCategories: ServiceMainCategory[]) => {
    setCategories([...categories, ...importedCategories]);
    setIsImportDialogOpen(false);
    toast.success(`Imported ${importedCategories.length} categories`);
  };

  // Determine if an item is selected
  const hasSelection = !!selectedCategoryId;

  return (
    <div className="h-full">
      <div className="mb-4 flex flex-wrap gap-2 bg-white p-3 shadow-sm border border-gray-200 rounded-xl">
        <Button variant="outline" onClick={handleCreateCategory} className="rounded-full text-sm border-blue-500 text-blue-600">
          <Plus className="h-4 w-4 mr-1" /> Category
        </Button>
        
        {selectedCategoryId && (
          <Button 
            variant="outline" 
            onClick={handleCreateSubcategory}
            className="rounded-full text-sm border-blue-500 text-blue-600"
          >
            <Plus className="h-4 w-4 mr-1" /> Subcategory
          </Button>
        )}
        
        {selectedSubcategoryId && (
          <Button 
            variant="outline" 
            onClick={handleCreateJob}
            className="rounded-full text-sm border-blue-500 text-blue-600"
          >
            <Plus className="h-4 w-4 mr-1" /> Service
          </Button>
        )}
        
        <div className="ml-auto flex gap-2">
          <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-full text-sm border-blue-500 text-blue-600">
                <Upload className="h-4 w-4 mr-1" /> Import
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Import Services</AlertDialogTitle>
                <AlertDialogDescription>
                  Upload an Excel file with your service catalog.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <ServiceBulkImport 
                onCancel={() => setIsImportDialogOpen(false)} 
                onComplete={handleImportComplete}
              />
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="rounded-full text-sm border-blue-500 text-blue-600"
          >
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200 rounded-xl">
          <TabsTrigger value="browse">
            Browse
          </TabsTrigger>
          {hasSelection && (
            <TabsTrigger value="edit">
              Edit
            </TabsTrigger>
          )}
          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports">
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-4">
          <ServiceHierarchyBrowser
            categories={categories}
            loading={loading}
            error={error}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            selectedJobId={selectedJobId}
            onSelectItem={handleSelectItem}
          />
          
          {hasSelection && (
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2Icon className="h-4 w-4 mr-1" /> Delete
              </Button>
              
              <Button 
                onClick={() => setActiveTab('edit')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <PencilIcon className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          )}
        </TabsContent>
        
        {hasSelection && (
          <TabsContent value="edit">
            <ServiceEditor
              category={selectedCategory}
              subcategory={selectedSubcategory}
              job={selectedJob}
              onSave={handleSave}
              onCancel={() => setActiveTab('browse')}
            />
          </TabsContent>
        )}
        
        <TabsContent value="analytics">
          <ServiceAnalytics categories={categories} />
        </TabsContent>
        
        <TabsContent value="reports">
          <ServicesPriceReport categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
