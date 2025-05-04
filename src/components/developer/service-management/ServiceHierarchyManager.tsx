
import React, { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Settings, BarChart4, FileText, Upload } from "lucide-react";
import { ServiceEditor } from "./ServiceEditor";
import { toast } from '@/components/ui/use-toast';
import { ServiceCategoriesList } from "./hierarchy/ServiceCategoriesList";
import { ServiceSearchBar } from './hierarchy/ServiceSearchBar';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import ServiceAnalytics from "./ServiceAnalytics";
import ServicesPriceReport from "./ServicesPriceReport";
import ServiceBulkImport from "./ServiceBulkImport";
import { CategoryColorStyle, DEFAULT_COLOR_STYLES } from './ServiceEditor';

// Mock data for initial development
const initialCategories: ServiceMainCategory[] = [];

const ServiceHierarchyManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('hierarchy');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Load categories from API or storage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // In a real app, this would be an API call
        // For now, just simulate loading
        setTimeout(() => {
          setCategories(initialCategories);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to load service categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedJob(undefined);
  };
  
  const handleJobSelect = (job: ServiceJob) => {
    setSelectedJob(job);
  };

  const handleAddCategory = () => {
    const newCategory: ServiceMainCategory = {
      id: nanoid(),
      name: "New Category",
      description: "",
      position: categories.length,
      subcategories: []
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    setSelectedCategory(newCategory);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
  };

  const handleAddSubcategory = () => {
    if (!selectedCategory) return;

    const newSubcategory: ServiceSubcategory = {
      id: nanoid(),
      name: "New Subcategory",
      description: "",
      jobs: []
    };

    const updatedCategory = {
      ...selectedCategory,
      subcategories: [...(selectedCategory.subcategories || []), newSubcategory]
    };

    const updatedCategories = categories.map(cat => 
      cat.id === selectedCategory.id ? updatedCategory : cat
    );
    
    setCategories(updatedCategories);
    setSelectedCategory(updatedCategory);
    setSelectedSubcategory(newSubcategory);
    setSelectedJob(undefined);
  };
  
  const handleAddJob = () => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    const newJob: ServiceJob = {
      id: nanoid(),
      name: "New Service",
      description: "",
      estimatedTime: 30,
      price: 0
    };
    
    // First, get the updated subcategory with the new job
    const updatedSubcategory = {
      ...selectedSubcategory,
      jobs: [...(selectedSubcategory.jobs || []), newJob]
    };
    
    // Then, update the category with the updated subcategory
    const updatedCategory = {
      ...selectedCategory,
      subcategories: (selectedCategory.subcategories || []).map(sub => 
        sub.id === selectedSubcategory.id ? updatedSubcategory : sub
      )
    };
    
    // Finally, update the categories array
    const updatedCategories = categories.map(cat => 
      cat.id === selectedCategory.id ? updatedCategory : cat
    );
    
    setCategories(updatedCategories);
    setSelectedCategory(updatedCategory);
    setSelectedSubcategory(updatedSubcategory);
    setSelectedJob(newJob);
  };

  const handleColorChange = (colorIndex: number) => {
    setSelectedColorIndex(colorIndex);
  };

  const handleSaveItem = (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => {
    // Handle main category update
    if (category && !subcategory && !job) {
      const updatedCategories = categories.map(cat => 
        cat.id === category.id ? category : cat
      );
      
      setCategories(updatedCategories);
      setSelectedCategory(category);
      toast({
        description: `Category "${category.name}" has been updated`,
      });
    }
    // Handle subcategory update
    else if (!category && subcategory && !job && selectedCategory) {
      const updatedSubcategories = (selectedCategory.subcategories || []).map(sub => 
        sub.id === subcategory.id ? subcategory : sub
      );
      
      const updatedCategory = {
        ...selectedCategory,
        subcategories: updatedSubcategories
      };
      
      const updatedCategories = categories.map(cat => 
        cat.id === selectedCategory.id ? updatedCategory : cat
      );
      
      setCategories(updatedCategories);
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(subcategory);
      
      toast({
        description: `Subcategory "${subcategory.name}" has been updated`,
      });
    }
    // Handle job update
    else if (!category && !subcategory && job && selectedCategory && selectedSubcategory) {
      const updatedJobs = (selectedSubcategory.jobs || []).map(j => 
        j.id === job.id ? job : j
      );
      
      const updatedSubcategory = {
        ...selectedSubcategory,
        jobs: updatedJobs
      };
      
      const updatedSubcategories = (selectedCategory.subcategories || []).map(sub => 
        sub.id === selectedSubcategory.id ? updatedSubcategory : sub
      );
      
      const updatedCategory = {
        ...selectedCategory,
        subcategories: updatedSubcategories
      };
      
      const updatedCategories = categories.map(cat => 
        cat.id === selectedCategory.id ? updatedCategory : cat
      );
      
      setCategories(updatedCategories);
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(updatedSubcategory);
      setSelectedJob(job);
      
      toast({
        description: `Service "${job.name}" has been updated`,
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
    
    toast({
      description: "Category has been deleted",
    });
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredCategories = searchQuery 
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const handleImportComplete = async () => {
    // Refresh the categories list
    setLoading(true);
    // In a real app, this would fetch updated data from an API
    setTimeout(() => {
      // For demo, just add a mock imported category
      const importedCategory: ServiceMainCategory = {
        id: nanoid(),
        name: "Imported Category",
        description: "This category was imported",
        position: categories.length,
        subcategories: []
      };
      setCategories([...categories, importedCategory]);
      setLoading(false);
      toast({
        description: "Categories have been imported successfully",
      });
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddCategory}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          {selectedCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSubcategory}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          )}
          {selectedCategory && selectedSubcategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddJob}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <ServiceSearchBar 
            query={searchQuery} 
            onQueryChange={setSearchQuery}
            onSearch={handleSearch}
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsBulkImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="hierarchy">
            <Settings className="h-4 w-4 mr-2" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart4 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="p-0 border-0">
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardContent className="p-4">
                <ServiceCategoriesList 
                  categories={filteredCategories}
                  selectedCategoryId={selectedCategory?.id}
                  onSelectCategory={handleCategorySelect}
                  isLoading={loading}
                />
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="p-4">
                {selectedCategory ? (
                  <ServiceEditor
                    category={selectedCategory}
                    subcategory={selectedSubcategory}
                    job={selectedJob}
                    onSave={handleSaveItem}
                    onDelete={handleDeleteCategory}
                    categoryColors={DEFAULT_COLOR_STYLES}
                    colorIndex={selectedColorIndex}
                    onColorChange={handleColorChange}
                  />
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500">Select a category to edit</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="p-0 border-0">
          <ServiceAnalytics categories={categories} />
        </TabsContent>
        
        <TabsContent value="reports" className="p-0 border-0">
          <ServicesPriceReport categories={categories} />
        </TabsContent>
      </Tabs>
      
      <ServiceBulkImport
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default ServiceHierarchyManager;
