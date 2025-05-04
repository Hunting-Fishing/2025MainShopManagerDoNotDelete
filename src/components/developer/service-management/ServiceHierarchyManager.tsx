import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Upload, Trash2 } from 'lucide-react';
import { ServiceCategoriesList } from './hierarchy/ServiceCategoriesList';
import { ServiceSearchBar } from './hierarchy/ServiceSearchBar';
import { ServiceCategoryDetails } from './hierarchy/ServiceCategoryDetails';
import ServiceBulkImport from './ServiceBulkImport';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

const ServiceHierarchyManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showBulkImport, setShowBulkImport] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCategories, setFilteredCategories] = useState<ServiceMainCategory[]>([]);
  const { toast } = useToast();
  
  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await fetchServiceCategories();
        setCategories(data);
        setFilteredCategories(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching service categories:', error);
        toast({
          title: "Failed to load services",
          description: "There was an error loading the service categories.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    loadCategories();
  }, [toast]);
  
  // Handle category selection
  const handleCategorySelect = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
  };
  
  // Add new category
  const handleAddCategory = async () => {
    try {
      // Create a new category with position at the end
      const newPosition = categories.length > 0 
        ? Math.max(...categories.map(c => c.position)) + 1 
        : 0;
      
      const newCategory = {
        id: crypto.randomUUID(),
        name: "New Category",
        description: "",
        position: newPosition,
        subcategories: []
      };
      
      // Save to database
      const savedCategory = await saveServiceCategory(newCategory);
      
      // Update state
      setCategories(prev => [...prev, savedCategory]);
      setFilteredCategories(prev => [...prev, savedCategory]);
      setSelectedCategory(savedCategory);
      
      toast({
        title: "Category created",
        description: "New service category has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Failed to create category",
        description: "There was an error creating the new category.",
        variant: "destructive"
      });
    }
  };
  
  // Save category changes
  const handleSaveCategory = async (updatedCategory: ServiceMainCategory) => {
    try {
      // Save to database
      const savedCategory = await saveServiceCategory(updatedCategory);
      
      // Update categories state
      setCategories(prev => 
        prev.map(c => c.id === savedCategory.id ? savedCategory : c)
      );
      
      // Update filtered categories
      setFilteredCategories(prev => 
        prev.map(c => c.id === savedCategory.id ? savedCategory : c)
      );
      
      // Update selected category if it's the one being edited
      if (selectedCategory?.id === savedCategory.id) {
        setSelectedCategory(savedCategory);
      }
      
      toast({
        title: "Changes saved",
        description: "Service category has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Failed to save changes",
        description: "There was an error updating the category.",
        variant: "destructive"
      });
    }
  };
  
  // Delete a category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Delete from database
      await deleteServiceCategory(categoryId);
      
      // Update state
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setFilteredCategories(prev => prev.filter(c => c.id !== categoryId));
      
      // Clear selection if the deleted category was selected
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
      }
      
      toast({
        title: "Category deleted",
        description: "Service category has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Failed to delete category",
        description: "There was an error deleting the category.",
        variant: "destructive"
      });
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredCategories(categories);
      return;
    }
    
    const lowercasedQuery = query.toLowerCase();
    
    const filtered = categories.filter(category => {
      // Search in category name or description
      if (
        category.name.toLowerCase().includes(lowercasedQuery) ||
        (category.description && category.description.toLowerCase().includes(lowercasedQuery))
      ) {
        return true;
      }
      
      // Search in subcategories
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (
            subcategory.name.toLowerCase().includes(lowercasedQuery) ||
            (subcategory.description && subcategory.description.toLowerCase().includes(lowercasedQuery))
          ) {
            return true;
          }
          
          // Search in jobs
          if (subcategory.jobs) {
            for (const job of subcategory.jobs) {
              if (
                job.name.toLowerCase().includes(lowercasedQuery) ||
                (job.description && job.description.toLowerCase().includes(lowercasedQuery))
              ) {
                return true;
              }
            }
          }
        }
      }
      
      return false;
    });
    
    setFilteredCategories(filtered);
  };
  
  // Handle bulk import
  const handleBulkImportComplete = (importedCategories: ServiceMainCategory[]) => {
    setShowBulkImport(false);
    
    // Refresh the categories list
    setCategories(prev => {
      // Merge imported categories with existing ones
      const merged = [...prev];
      
      importedCategories.forEach(importedCategory => {
        const existingIndex = merged.findIndex(c => c.id === importedCategory.id);
        if (existingIndex >= 0) {
          merged[existingIndex] = importedCategory;
        } else {
          merged.push(importedCategory);
        }
      });
      
      return merged;
    });
    
    // Update filtered categories
    setFilteredCategories(prev => {
      // If no search query, show all categories
      if (!searchQuery) {
        return [...categories];
      }
      
      // Otherwise, reapply search filter
      return prev;
    });
    
    toast({
      title: "Import successful",
      description: `${importedCategories.length} service categories were imported successfully.`,
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <ServiceSearchBar onSearch={handleSearch} />
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={handleAddCategory}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Category
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowBulkImport(true)}
          >
            <Upload className="w-4 h-4 mr-1" />
            Bulk Import
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 h-[70vh] flex flex-col">
          <CardContent className="p-3 flex-grow overflow-hidden">
            <ServiceCategoriesList 
              categories={filteredCategories}
              selectedCategoryId={selectedCategory?.id}
              onSelectCategory={handleCategorySelect}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 h-[70vh] overflow-auto">
          <CardContent className="p-4">
            {selectedCategory ? (
              <ServiceCategoryDetails 
                category={selectedCategory}
                onSave={handleSaveCategory}
                onDelete={handleDeleteCategory}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Category Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a category from the list or create a new one to get started.
                </p>
                <Button onClick={handleAddCategory}>Create New Category</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogTitle>Bulk Import Services</AlertDialogTitle>
          <ServiceBulkImport 
            onCancel={() => setShowBulkImport(false)} 
            onComplete={handleBulkImportComplete}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceHierarchyManager;
