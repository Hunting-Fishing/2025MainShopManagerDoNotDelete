
import React, { useState, useEffect } from 'react';
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from "@/types/serviceHierarchy";
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { ServiceEditor } from './ServiceEditor';
import { ServiceAnalytics } from './ServiceAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cloneCategory } from '@/lib/services/serviceUtils';
import { ServicesPriceReport } from './ServicesPriceReport';
import { ServiceBulkImport } from './ServiceBulkImport';

const ServiceHierarchyManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  // Editor state
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | undefined>(undefined);
  const [editorMode, setEditorMode] = useState<'category' | 'subcategory' | 'job' | 'none'>('none');

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchServiceCategories();
      setCategories(data);
      console.log('Loaded categories:', data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handler for selecting a category
  const handleSelectCategory = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
    setEditorMode('category');
  };

  // Handler for selecting a subcategory
  const handleSelectSubcategory = (category: ServiceMainCategory, subcategory: ServiceSubcategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedJob(undefined);
    setEditorMode('subcategory');
  };

  // Handler for selecting a job
  const handleSelectJob = (category: ServiceMainCategory, subcategory: ServiceSubcategory, job: ServiceJob) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedJob(job);
    setEditorMode('job');
  };

  // Handler for adding a new category
  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
    setEditorMode('category');
  };

  // Handler for adding a new subcategory
  const handleAddSubcategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setSelectedSubcategory(undefined);
      setSelectedJob(undefined);
      setEditorMode('subcategory');
    }
  };

  // Handler for adding a new job
  const handleAddJob = (categoryId: string, subcategoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      const subcategory = category.subcategories.find(s => s.id === subcategoryId);
      if (subcategory) {
        setSelectedCategory(category);
        setSelectedSubcategory(subcategory);
        setSelectedJob(undefined);
        setEditorMode('job');
      }
    }
  };

  // Handler for canceling editing
  const handleCancelEdit = () => {
    setEditorMode('none');
  };

  // Handler for saving items
  const handleSave = async (
    data: ServiceMainCategory | ServiceSubcategory | ServiceJob,
    mode: 'category' | 'subcategory' | 'job',
    parentIds?: { categoryId?: string; subcategoryId?: string }
  ) => {
    try {
      if (mode === 'category') {
        // Save the category directly
        const categoryData = data as ServiceMainCategory;
        await saveServiceCategory(categoryData);
        await loadCategories(); // Reload all categories
      } else {
        // For subcategory and job, we need to update the parent category
        if (!parentIds?.categoryId) {
          throw new Error("Missing parent category ID");
        }

        // Find the parent category
        const categoryIndex = categories.findIndex(c => c.id === parentIds.categoryId);
        if (categoryIndex === -1) {
          throw new Error("Parent category not found");
        }

        // Clone the category to avoid direct state mutation
        const updatedCategory = cloneCategory(categories[categoryIndex]);

        if (mode === 'subcategory') {
          const subcategoryData = data as ServiceSubcategory;
          
          // Check if it's an update or a new subcategory
          const subcategoryIndex = updatedCategory.subcategories.findIndex(
            s => s.id === subcategoryData.id
          );

          if (subcategoryIndex !== -1) {
            // Update existing subcategory
            updatedCategory.subcategories[subcategoryIndex] = subcategoryData;
          } else {
            // Add new subcategory
            updatedCategory.subcategories.push({
              ...subcategoryData,
              id: subcategoryData.id || uuidv4()
            });
          }
        } else if (mode === 'job') {
          if (!parentIds.subcategoryId) {
            throw new Error("Missing parent subcategory ID");
          }

          const jobData = data as ServiceJob;
          
          // Find the parent subcategory
          const subcategoryIndex = updatedCategory.subcategories.findIndex(
            s => s.id === parentIds.subcategoryId
          );

          if (subcategoryIndex === -1) {
            throw new Error("Parent subcategory not found");
          }

          // Check if it's an update or a new job
          const jobIndex = updatedCategory.subcategories[subcategoryIndex].jobs.findIndex(
            j => j.id === jobData.id
          );

          if (jobIndex !== -1) {
            // Update existing job
            updatedCategory.subcategories[subcategoryIndex].jobs[jobIndex] = jobData;
          } else {
            // Add new job
            updatedCategory.subcategories[subcategoryIndex].jobs.push({
              ...jobData,
              id: jobData.id || uuidv4()
            });
          }
        }

        // Save the updated category
        await saveServiceCategory(updatedCategory);
        await loadCategories(); // Reload all categories
      }

      // Reset selection after save
      if (mode === 'category') {
        const savedCategory = data as ServiceMainCategory;
        const refreshedCategory = (await fetchServiceCategories()).find(c => c.id === savedCategory.id);
        if (refreshedCategory) {
          setSelectedCategory(refreshedCategory);
        }
      } else if (mode === 'subcategory' && parentIds?.categoryId) {
        const savedSubcategory = data as ServiceSubcategory;
        const refreshedCategories = await fetchServiceCategories();
        const refreshedCategory = refreshedCategories.find(c => c.id === parentIds.categoryId);
        
        if (refreshedCategory) {
          setSelectedCategory(refreshedCategory);
          const refreshedSubcategory = refreshedCategory.subcategories.find(s => s.id === savedSubcategory.id);
          if (refreshedSubcategory) {
            setSelectedSubcategory(refreshedSubcategory);
          }
        }
      }

    } catch (err) {
      console.error('Failed to save:', err);
      toast({
        title: "Error",
        description: `Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Handler for deleting items
  const handleDelete = async (
    id: string,
    mode: 'category' | 'subcategory' | 'job',
    parentIds?: { categoryId?: string; subcategoryId?: string }
  ) => {
    try {
      if (mode === 'category') {
        // Delete the category directly
        await deleteServiceCategory(id);
        setEditorMode('none');
        toast({
          title: "Category deleted",
          description: "Category has been deleted successfully."
        });
      } else {
        // For subcategory and job, we need to update the parent category
        if (!parentIds?.categoryId) {
          throw new Error("Missing parent category ID");
        }

        // Find the parent category
        const categoryIndex = categories.findIndex(c => c.id === parentIds.categoryId);
        if (categoryIndex === -1) {
          throw new Error("Parent category not found");
        }

        // Clone the category to avoid direct state mutation
        const updatedCategory = cloneCategory(categories[categoryIndex]);

        if (mode === 'subcategory') {
          // Remove the subcategory
          updatedCategory.subcategories = updatedCategory.subcategories.filter(s => s.id !== id);
          setEditorMode('none');
        } else if (mode === 'job') {
          if (!parentIds.subcategoryId) {
            throw new Error("Missing parent subcategory ID");
          }

          // Find the parent subcategory
          const subcategoryIndex = updatedCategory.subcategories.findIndex(
            s => s.id === parentIds.subcategoryId
          );

          if (subcategoryIndex === -1) {
            throw new Error("Parent subcategory not found");
          }

          // Remove the job
          updatedCategory.subcategories[subcategoryIndex].jobs = 
            updatedCategory.subcategories[subcategoryIndex].jobs.filter(j => j.id !== id);
        }

        // Save the updated category
        await saveServiceCategory(updatedCategory);
        setEditorMode('none');
        toast({
          title: `${mode === 'subcategory' ? 'Subcategory' : 'Job'} deleted`,
          description: `${mode === 'subcategory' ? 'Subcategory' : 'Job'} has been deleted successfully.`
        });
      }

      // Reload categories
      await loadCategories();
    } catch (err) {
      console.error('Failed to delete:', err);
      toast({
        title: "Error",
        description: `Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const exportToJson = () => {
    // Create a JSON file with categories data
    const dataStr = JSON.stringify(categories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'service-categories.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToJson}>
            <Download className="h-4 w-4 mr-2" />
            Export Services
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="browse">Browse & Edit</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Price Report</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                Error loading service categories: {error}
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ServiceHierarchyBrowser
                categories={categories}
                onSelectCategory={handleSelectCategory}
                onSelectSubcategory={handleSelectSubcategory}
                onSelectJob={handleSelectJob}
                onAddCategory={handleAddCategory}
                onAddSubcategory={handleAddSubcategory}
                onAddJob={handleAddJob}
              />
              
              <ServiceEditor
                category={selectedCategory}
                subcategory={selectedSubcategory}
                job={selectedJob}
                mode={editorMode}
                onSave={handleSave}
                onCancel={handleCancelEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ServiceAnalytics categories={categories} />
          )}
        </TabsContent>

        <TabsContent value="pricing">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ServicesPriceReport categories={categories} />
          )}
        </TabsContent>

        <TabsContent value="import">
          <ServiceBulkImport onImportComplete={loadCategories} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceHierarchyManager;
