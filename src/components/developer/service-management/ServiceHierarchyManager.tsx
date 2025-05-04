import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Upload, FilePlus, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { ServiceSearchBar } from "./hierarchy/ServiceSearchBar";
import { ServiceCategoriesList } from "./hierarchy/ServiceCategoriesList";
import { ServiceEditor } from "./ServiceEditor";
import ServiceBulkImport from "./ServiceBulkImport";
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from "@/lib/services/serviceApi";
import { v4 as uuidv4 } from 'uuid';

export const ServiceHierarchyManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showBulkImportDialog, setShowBulkImportDialog] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("categories");

  // Category styles for visual differentiation
  const categoryStyles = {
    "engine": { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
    "electrical": { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
    "transmission": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    "brakes": { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
    "body": { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
    "interior": { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-200" },
    "suspension": { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
    "custom": { bg: "bg-slate-50", text: "text-slate-800", border: "border-slate-200" }
  };

  // Fetch categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories from API
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
      
      // If we have categories, select the first one by default
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading service categories:", error);
      toast({
        title: "Error",
        description: "Could not load service categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    
    return categories.map(category => {
      // Check if category name matches
      const categoryMatches = category.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter subcategories
      const filteredSubcategories = category.subcategories?.filter(subcategory => {
        // Check if subcategory name matches
        const subcategoryMatches = subcategory.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter jobs
        const filteredJobs = subcategory.jobs?.filter(job => 
          job.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Return subcategory if it matches or has matching jobs
        return subcategoryMatches || (filteredJobs && filteredJobs.length > 0);
      });
      
      // If category matches or has matching subcategories, return modified category
      if (categoryMatches || (filteredSubcategories && filteredSubcategories.length > 0)) {
        return {
          ...category,
          subcategories: filteredSubcategories
        };
      }
      
      // Otherwise return null (will be filtered out)
      return null;
    }).filter(Boolean) as ServiceMainCategory[];
  }, [categories, searchQuery]);

  // Find selected entities
  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const selectedSubcategory = useMemo(() => {
    if (!selectedCategory || !selectedSubcategoryId) return null;
    return selectedCategory.subcategories?.find(s => s.id === selectedSubcategoryId) || null;
  }, [selectedCategory, selectedSubcategoryId]);

  const selectedJob = useMemo(() => {
    if (!selectedSubcategory || !selectedJobId) return null;
    return selectedSubcategory.jobs?.find(j => j.id === selectedJobId) || null;
  }, [selectedSubcategory, selectedJobId]);

  // Create a new category
  const handleCreateCategory = async () => {
    const newCategory: ServiceMainCategory = {
      id: uuidv4(),
      name: "New Category",
      description: "",
      position: categories.length,
      subcategories: []
    };
    
    try {
      const savedCategory = await saveServiceCategory(newCategory);
      setCategories([...categories, savedCategory]);
      setSelectedCategoryId(savedCategory.id);
      setSelectedSubcategoryId(null);
      setSelectedJobId(null);
      setActiveTab("editor");
      
      toast({
        title: "Success",
        description: "New category created",
      });
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Could not create new category",
        variant: "destructive",
      });
    }
  };

  // Create a new subcategory
  const handleCreateSubcategory = () => {
    if (!selectedCategory) {
      toast({
        title: "Warning",
        description: "Please select a category first",
        variant: "warning",
      });
      return;
    }
    
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: "New Subcategory",
      description: "",
      jobs: []
    };
    
    const updatedCategory = {
      ...selectedCategory,
      subcategories: [...(selectedCategory.subcategories || []), newSubcategory]
    };
    
    handleSaveCategory(updatedCategory);
    setSelectedSubcategoryId(newSubcategory.id);
    setSelectedJobId(null);
    setActiveTab("editor");
  };

  // Create a new job
  const handleCreateJob = () => {
    if (!selectedCategory || !selectedSubcategory) {
      toast({
        title: "Warning",
        description: "Please select a subcategory first",
        variant: "warning",
      });
      return;
    }
    
    const newJob: ServiceJob = {
      id: uuidv4(),
      name: "New Job",
      description: "",
      estimatedTime: 60,
      price: 0
    };
    
    const updatedSubcategories = selectedCategory.subcategories?.map(sub => {
      if (sub.id === selectedSubcategoryId) {
        return {
          ...sub,
          jobs: [...(sub.jobs || []), newJob]
        };
      }
      return sub;
    });
    
    const updatedCategory = {
      ...selectedCategory,
      subcategories: updatedSubcategories
    };
    
    handleSaveCategory(updatedCategory);
    setSelectedJobId(newJob.id);
    setActiveTab("editor");
  };

  // Save updated category
  const handleSaveCategory = async (updatedCategory: ServiceMainCategory) => {
    try {
      const saved = await saveServiceCategory(updatedCategory);
      
      setCategories(prevCategories => {
        return prevCategories.map(category => 
          category.id === saved.id ? saved : category
        );
      });
      
      toast({
        title: "Success",
        description: "Changes saved successfully",
      });
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Could not save changes",
        variant: "destructive",
      });
    }
  };

  // Delete selected item (category, subcategory, or job)
  const handleDeleteSelected = async () => {
    if (selectedJobId && selectedSubcategoryId && selectedCategoryId) {
      // Delete job
      const updatedSubcategory = {
        ...selectedSubcategory!,
        jobs: selectedSubcategory!.jobs?.filter(job => job.id !== selectedJobId)
      };
      
      const updatedCategory = {
        ...selectedCategory!,
        subcategories: selectedCategory!.subcategories?.map(sub => 
          sub.id === selectedSubcategoryId ? updatedSubcategory : sub
        )
      };
      
      await handleSaveCategory(updatedCategory);
      setSelectedJobId(null);
      toast({
        title: "Success",
        description: "Job deleted successfully"
      });
    }
    else if (selectedSubcategoryId && selectedCategoryId) {
      // Delete subcategory
      const updatedCategory = {
        ...selectedCategory!,
        subcategories: selectedCategory!.subcategories?.filter(sub => sub.id !== selectedSubcategoryId)
      };
      
      await handleSaveCategory(updatedCategory);
      setSelectedSubcategoryId(null);
      setSelectedJobId(null);
      toast({
        title: "Success",
        description: "Subcategory deleted successfully"
      });
    }
    else if (selectedCategoryId) {
      // Delete category
      try {
        await deleteServiceCategory(selectedCategoryId);
        setCategories(categories.filter(c => c.id !== selectedCategoryId));
        setSelectedCategoryId(categories.length > 1 ? categories[0].id : null);
        setSelectedSubcategoryId(null);
        setSelectedJobId(null);
        toast({
          title: "Success",
          description: "Category deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting category:", error);
        toast({
          title: "Error",
          description: "Could not delete category",
          variant: "destructive",
        });
      }
    }
  };

  // Handle bulk import completion
  const handleImportComplete = () => {
    loadCategories();
    setShowBulkImportDialog(false);
    toast({
      title: "Success",
      description: "Service data imported successfully"
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left panel - Categories list */}
      <Card className="md:col-span-1 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-lg">Service Hierarchy</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowBulkImportDialog(true)}
              className="text-xs h-8"
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Import
            </Button>
          </div>
          <ServiceSearchBar 
            onSearch={(query) => setSearchQuery(query)}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            placeholder="Search services..."
          />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={handleCreateCategory} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
              <PlusCircle className="h-4 w-4 mr-1" />
              Category
            </Button>
            <Button 
              onClick={handleCreateSubcategory} 
              size="sm" 
              className="flex-1"
              disabled={!selectedCategoryId}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Subcategory
            </Button>
            <Button 
              onClick={handleCreateJob} 
              size="sm" 
              className="flex-1"
              disabled={!selectedSubcategoryId}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Job
            </Button>
          </div>

          <ServiceCategoriesList
            categories={filteredCategories}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            selectedJobId={selectedJobId}
            onCategorySelect={setSelectedCategoryId}
            onSubcategorySelect={(id) => {
              setSelectedSubcategoryId(id);
              setSelectedJobId(null);
            }}
            onJobSelect={setSelectedJobId}
            isLoading={isLoading}
            categoryStyles={categoryStyles}
          />
        </CardContent>
      </Card>

      {/* Right panel - Editor */}
      <Card className="md:col-span-2">
        <CardHeader className="bg-slate-50 border-b pb-3">
          <div className="flex justify-between items-center">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {(selectedCategoryId || selectedSubcategoryId || selectedJobId) && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteSelected}
                className="ml-4"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <TabsContent value="categories" className="mt-0">
            {selectedCategory && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Categories Overview</h3>
                <p className="text-sm text-slate-500">
                  Manage your service categories, subcategories, and jobs. Select an item from the left panel to edit its details.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {categories.map(category => (
                    <Card key={category.id} className="overflow-hidden border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setActiveTab("editor");
                      }}>
                      <CardHeader className={`py-3 px-4 ${getCategoryHeaderClass(category.name)}`}>
                        <CardTitle className="text-base">{category.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm text-slate-500">
                          {category.subcategories?.length || 0} subcategories
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {countJobs(category)} jobs
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {!selectedCategory && !isLoading && (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <div className="mb-2 text-lg font-medium">No Category Selected</div>
                <p className="text-slate-500 mb-4">Select a category from the list or create a new one</p>
                <Button onClick={handleCreateCategory}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  Create New Category
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="editor" className="mt-0">
            <ServiceEditor 
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              selectedJob={selectedJob}
              onSave={handleSaveCategory}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <div className="text-center p-8 border border-dashed rounded-lg">
              <div className="mb-2 text-lg font-medium">Service Analytics</div>
              <p className="text-slate-500 mb-4">This feature is coming soon. Analytics will show usage data for your services.</p>
            </div>
          </TabsContent>
        </CardContent>
      </Card>

      {/* Bulk Import Dialog */}
      <ServiceBulkImport 
        open={showBulkImportDialog} 
        onOpenChange={setShowBulkImportDialog}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
  
  // Helper functions
  
  // Get the appropriate header class for a category card based on its name
  function getCategoryHeaderClass(categoryName: string): string {
    const lowerName = categoryName.toLowerCase();
    
    if (lowerName.includes('engine')) return 'bg-red-50';
    if (lowerName.includes('brake')) return 'bg-blue-50';
    if (lowerName.includes('electric')) return 'bg-purple-50';
    if (lowerName.includes('transmission')) return 'bg-amber-50';
    if (lowerName.includes('suspension')) return 'bg-green-50';
    if (lowerName.includes('tire')) return 'bg-teal-50';
    if (lowerName.includes('body')) return 'bg-orange-50';
    if (lowerName.includes('interior')) return 'bg-cyan-50';
    
    return 'bg-slate-50';
  }
  
  // Count the total number of jobs in a category
  function countJobs(category: ServiceMainCategory): number {
    let count = 0;
    category.subcategories?.forEach(sub => {
      count += sub.jobs?.length || 0;
    });
    return count;
  }
};

export default ServiceHierarchyManager;
