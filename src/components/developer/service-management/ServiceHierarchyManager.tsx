
import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FilePlus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  ServiceMainCategory, 
  ServiceSubcategory,
  ServiceJob,
  CategoryColorStyle
} from "@/types/serviceHierarchy";
import { ServiceCategoriesList } from "./hierarchy/ServiceCategoriesList";
import { ServiceEditor } from "./ServiceEditor";
import ServiceBulkImport from "./ServiceBulkImport";
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from "@/lib/services/serviceApi";
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_COLOR_STYLES } from './ServiceEditor';

interface ServiceHierarchyState {
  categories: ServiceMainCategory[];
  selectedCategory: ServiceMainCategory | null;
  selectedSubcategory: ServiceSubcategory | null;
  selectedJob: ServiceJob | null;
  isLoading: boolean;
  isImportModalOpen: boolean;
  categoryColorStyles: Record<string, CategoryColorStyle>;
}

const ServiceHierarchyManager: React.FC = () => {
  const [state, setState] = useState<ServiceHierarchyState>({
    categories: [],
    selectedCategory: null,
    selectedSubcategory: null,
    selectedJob: null,
    isLoading: true,
    isImportModalOpen: false,
    categoryColorStyles: {}
  });
  const { toast } = useToast();

  const loadCategories = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const data = await fetchServiceCategories();
      setState(prev => ({ 
        ...prev, 
        categories: data,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to load service categories:", error);
      toast({
        title: "Error loading service categories",
        description: "Could not load service categories. Please try again later.",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCategorySelect = (categoryId: string) => {
    const category = state.categories.find(c => c.id === categoryId) || null;
    setState(prev => ({ 
      ...prev, 
      selectedCategory: category,
      selectedSubcategory: null,
      selectedJob: null
    }));
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    if (!state.selectedCategory) return;
    
    const subcategory = state.selectedCategory.subcategories?.find(sc => sc.id === subcategoryId) || null;
    setState(prev => ({ 
      ...prev, 
      selectedSubcategory: subcategory,
      selectedJob: null
    }));
  };

  const handleJobSelect = (jobId: string) => {
    if (!state.selectedCategory || !state.selectedSubcategory) return;
    
    const job = state.selectedSubcategory.jobs?.find(j => j.id === jobId) || null;
    setState(prev => ({ 
      ...prev, 
      selectedJob: job
    }));
  };

  const handleAddCategory = () => {
    const maxPosition = Math.max(0, ...state.categories.map(c => c.position || 0));
    const newCategory: ServiceMainCategory = {
      id: uuidv4(),
      name: 'New Category',
      description: '',
      position: maxPosition + 1,
      subcategories: [{
        id: uuidv4(),
        name: 'New Subcategory',
        jobs: [{
          id: uuidv4(),
          name: 'New Service',
          price: 0,
          estimatedTime: 30
        }]
      }]
    };
    
    setState(prev => ({ 
      ...prev, 
      categories: [...prev.categories, newCategory],
      selectedCategory: newCategory,
      selectedSubcategory: newCategory.subcategories?.[0] || null,
      selectedJob: newCategory.subcategories?.[0]?.jobs?.[0] || null
    }));
  };

  const handleAddSubcategory = () => {
    if (!state.selectedCategory) return;
    
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: 'New Subcategory',
      jobs: [{
        id: uuidv4(),
        name: 'New Service',
        price: 0,
        estimatedTime: 30
      }]
    };
    
    const updatedCategory = { 
      ...state.selectedCategory,
      subcategories: [...(state.selectedCategory.subcategories || []), newSubcategory] 
    };
    
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === updatedCategory.id ? updatedCategory : c
      ),
      selectedCategory: updatedCategory,
      selectedSubcategory: newSubcategory,
      selectedJob: newSubcategory.jobs?.[0] || null
    }));
  };

  const handleAddJob = () => {
    if (!state.selectedCategory || !state.selectedSubcategory) return;
    
    const newJob: ServiceJob = {
      id: uuidv4(),
      name: 'New Service',
      price: 0,
      estimatedTime: 30
    };
    
    const updatedSubcategory = {
      ...state.selectedSubcategory,
      jobs: [...(state.selectedSubcategory.jobs || []), newJob]
    };
    
    const updatedCategory = {
      ...state.selectedCategory,
      subcategories: (state.selectedCategory.subcategories || []).map(sc => 
        sc.id === updatedSubcategory.id ? updatedSubcategory : sc
      )
    };
    
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === updatedCategory.id ? updatedCategory : c
      ),
      selectedCategory: updatedCategory,
      selectedSubcategory: updatedSubcategory,
      selectedJob: newJob
    }));
  };

  const handleSaveItem = async (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => {
    if (!state.selectedCategory) return;
    
    try {
      let updatedCategory = { ...state.selectedCategory };
      
      if (category) {
        updatedCategory = { ...updatedCategory, ...category };
      } else if (subcategory && state.selectedSubcategory) {
        updatedCategory = {
          ...updatedCategory,
          subcategories: (updatedCategory.subcategories || []).map(sc => 
            sc.id === state.selectedSubcategory?.id ? subcategory : sc
          )
        };
      } else if (job && state.selectedSubcategory) {
        const updatedSubcategory = {
          ...state.selectedSubcategory,
          jobs: (state.selectedSubcategory.jobs || []).map(j => 
            j.id === job.id ? job : j
          )
        };
        
        updatedCategory = {
          ...updatedCategory,
          subcategories: (updatedCategory.subcategories || []).map(sc => 
            sc.id === updatedSubcategory.id ? updatedSubcategory : sc
          )
        };
      }
      
      const savedCategory = await saveServiceCategory(updatedCategory);
      
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(c => c.id === savedCategory.id ? savedCategory : c),
        selectedCategory: savedCategory,
        selectedSubcategory: subcategory || prev.selectedSubcategory,
        selectedJob: job || prev.selectedJob
      }));
      
      toast({
        title: "Success",
        description: "Service item updated successfully",
      });
    } catch (error) {
      console.error("Failed to save service item:", error);
      toast({
        title: "Error",
        description: "Failed to save service item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c.id !== categoryId),
        selectedCategory: null,
        selectedSubcategory: null,
        selectedJob: null
      }));
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleColorChange = (index: number) => {
    if (!state.selectedCategory) return;
    
    const categoryId = state.selectedCategory.id;
    setState(prev => ({
      ...prev,
      categoryColorStyles: {
        ...prev.categoryColorStyles,
        [categoryId]: DEFAULT_COLOR_STYLES[index]
      }
    }));
  };

  const handleImportComplete = () => {
    setState(prev => ({ ...prev, isImportModalOpen: false }));
    loadCategories();
    toast({
      title: "Import Successful",
      description: "Service categories imported successfully",
    });
  };

  // Get the color style for the current category
  const selectedCategoryColorIndex = state.selectedCategory 
    ? DEFAULT_COLOR_STYLES.findIndex(style => 
        JSON.stringify(style) === JSON.stringify(state.categoryColorStyles[state.selectedCategory.id])
      )
    : 0;

  // Use the default color (index 0) if no match is found
  const colorIndex = selectedCategoryColorIndex >= 0 ? selectedCategoryColorIndex : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Service Categories</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setState(prev => ({ ...prev, isImportModalOpen: true }))}>
                <FilePlus className="h-4 w-4 mr-1" />
                Import
              </Button>
              <Button variant="default" size="sm" onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <ServiceCategoriesList
            categories={state.categories}
            selectedCategoryId={state.selectedCategory?.id || null}
            selectedSubcategoryId={state.selectedSubcategory?.id || null}
            selectedJobId={state.selectedJob?.id || null}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            onJobSelect={handleJobSelect}
            isLoading={state.isLoading}
            categoryStyles={state.categoryColorStyles}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          {state.selectedCategory ? (
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Edit Service</h3>
                <div className="space-x-2">
                  {state.selectedSubcategory && (
                    <Button variant="outline" size="sm" onClick={handleAddJob}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Service
                    </Button>
                  )}
                  {state.selectedCategory && (
                    <Button variant="outline" size="sm" onClick={handleAddSubcategory}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subcategory
                    </Button>
                  )}
                </div>
              </div>

              <ServiceEditor
                category={state.selectedCategory}
                subcategory={state.selectedSubcategory}
                job={state.selectedJob}
                onSave={handleSaveItem}
                onDelete={handleDeleteCategory}
                categoryColors={DEFAULT_COLOR_STYLES}
                colorIndex={colorIndex}
                onColorChange={handleColorChange}
              />
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Select a category from the list to edit or create a new one.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}
      <ServiceBulkImport
        open={state.isImportModalOpen}
        onOpenChange={(open) => setState(prev => ({ ...prev, isImportModalOpen: open }))}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default ServiceHierarchyManager;
