
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus, Upload, Download, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceSearchBar } from './hierarchy/ServiceSearchBar';
import { ServiceCategoryDetails } from './hierarchy/ServiceCategoryDetails';
import { ServiceBulkImport } from './ServiceBulkImport';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { createEmptyCategory, sortCategoriesByPosition } from '@/lib/services/serviceUtils';

// Default color styles for service categories
export const DEFAULT_COLOR_STYLES = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
];

const ServiceHierarchyManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('categories');
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showImport, setShowImport] = useState<boolean>(false);
  const { toast } = useToast();

  // Load service categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await fetchServiceCategories();
      const sortedData = sortCategoriesByPosition(data);
      setCategories(sortedData);
      setFilteredCategories(sortedData);
      
      // Select first category if available and none selected
      if (sortedData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(sortedData[0].id);
      }
    } catch (error) {
      console.error("Failed to load service categories:", error);
      toast({
        title: "Error",
        description: "Could not load service categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredCategories(categories);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    // Filter based on category name, subcategory name, or job names
    const filtered = categories.filter(category => {
      // Match category name
      if (category.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Match subcategories
      const matchingSubcategories = category.subcategories?.filter(sub => {
        // Match subcategory name
        if (sub.name.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        // Match jobs in subcategory
        return sub.jobs?.some(job => job.name.toLowerCase().includes(lowerQuery));
      });
      
      return matchingSubcategories?.length > 0;
    });
    
    setFilteredCategories(filtered);
  };

  const handleAddCategory = async () => {
    try {
      const newCategoryPosition = categories.length;
      const newCategory = createEmptyCategory(newCategoryPosition);
      
      const savedCategory = await saveServiceCategory(newCategory);
      setCategories([...categories, savedCategory]);
      setFilteredCategories([...categories, savedCategory]);
      setSelectedCategoryId(savedCategory.id);
      
      toast({
        title: "Success",
        description: "New service category created",
      });
    } catch (error) {
      console.error("Failed to create service category:", error);
      toast({
        title: "Error",
        description: "Could not create service category",
        variant: "destructive",
      });
    }
  };

  const handleSaveCategory = async (updatedCategory: ServiceMainCategory) => {
    try {
      const savedCategory = await saveServiceCategory(updatedCategory);
      
      // Update the categories list with the saved category
      const updatedCategories = categories.map(cat => 
        cat.id === savedCategory.id ? savedCategory : cat
      );
      
      setCategories(updatedCategories);
      setFilteredCategories(
        filteredCategories.map(cat => cat.id === savedCategory.id ? savedCategory : cat)
      );
      
      toast({
        title: "Success",
        description: "Service category updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to save service category:", error);
      toast({
        title: "Error",
        description: "Could not save service category",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      
      // Remove the deleted category from state
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      setFilteredCategories(filteredCategories.filter(cat => cat.id !== categoryId));
      
      // If the currently selected category was deleted, select another
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(updatedCategories.length > 0 ? updatedCategories[0].id : null);
      }
      
      toast({
        title: "Success",
        description: "Service category deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete service category:", error);
      toast({
        title: "Error",
        description: "Could not delete service category",
        variant: "destructive",
      });
    }
  };

  const selectedCategory = filteredCategories.find(cat => cat.id === selectedCategoryId) || null;

  return (
    <>
      {showImport ? (
        <ServiceBulkImport 
          onClose={() => setShowImport(false)} 
          onImportComplete={loadCategories}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <ServiceSearchBar onSearch={handleSearch} />
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowImport(true)}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button 
                onClick={handleAddCategory} 
                size="sm"
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <Card className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading service categories...</p>
            </Card>
          ) : filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="text-center p-10">
                <p className="text-muted-foreground mb-4">
                  No service categories found. Add your first service category to get started.
                </p>
                <Button onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 h-[calc(100vh-260px)] min-h-[500px]">
              <div className="w-64 overflow-y-auto border rounded-md">
                <div className="p-2">
                  {filteredCategories.map((category, index) => (
                    <div 
                      key={category.id} 
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`p-2 mb-1 rounded-md cursor-pointer border ${
                        selectedCategoryId === category.id 
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted border-transparent"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${DEFAULT_COLOR_STYLES[index % DEFAULT_COLOR_STYLES.length].bg}`} />
                        <span className="ml-2 truncate">{category.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 pl-5">
                        {category.subcategories?.length || 0} subcategories
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto border rounded-md">
                {selectedCategory ? (
                  <ServiceCategoryDetails 
                    category={selectedCategory} 
                    onSave={handleSaveCategory}
                    onDelete={handleDeleteCategory}
                    colorStyle={DEFAULT_COLOR_STYLES[filteredCategories.findIndex(c => c.id === selectedCategoryId) % DEFAULT_COLOR_STYLES.length]}
                  />
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Select a service category from the list to edit its details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ServiceHierarchyManager;
