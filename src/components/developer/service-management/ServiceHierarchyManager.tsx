
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { PlusCircle, Upload, BarChart3 } from 'lucide-react';
import ServiceEditor from "./ServiceEditor";
import { toast } from "@/components/ui/use-toast";
import { ServiceCategoriesList } from "./hierarchy/ServiceCategoriesList";
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';
import { CategoryColorStyle } from "./ServiceEditor";
import ServiceAnalytics from "./ServiceAnalytics";
import ServicesPriceReport from "./ServicesPriceReport";
import ServiceBulkImport from "./ServiceBulkImport";
import { ServiceSearchBar } from "./hierarchy/ServiceSearchBar";

interface ServiceHierarchyManagerProps {
  // Add any props if needed
}

const ServiceHierarchyManager: React.FC<ServiceHierarchyManagerProps> = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | undefined>(undefined);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  
  // Fetch all service categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchServiceCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load service categories:", error);
        toast({
          title: "Error",
          description: "Failed to load service categories",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);
  
  // Handle category selection
  const handleSelectCategory = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
  };
  
  // Handle subcategory selection
  const handleSelectSubcategory = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedJob(undefined);
  };
  
  // Handle job selection
  const handleSelectJob = (job: ServiceJob) => {
    setSelectedJob(job);
  };
  
  // Create a new blank category
  const handleAddCategory = () => {
    const newCategory: ServiceMainCategory = {
      id: `temp-${Date.now()}`,
      name: "New Category",
      description: "",
      position: categories.length,
      subcategories: []
    };
    
    setSelectedCategory(newCategory);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
    setIsCreatingCategory(true);
  };
  
  // Create a new blank subcategory
  const handleAddSubcategory = () => {
    if (!selectedCategory) return;
    
    const newSubcategory: ServiceSubcategory = {
      id: `temp-${Date.now()}`,
      name: "New Subcategory",
      description: "",
      jobs: []
    };
    
    setSelectedSubcategory(newSubcategory);
    setSelectedJob(undefined);
    setIsCreatingSubcategory(true);
  };
  
  // Create a new blank job
  const handleAddJob = () => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    const newJob: ServiceJob = {
      id: `temp-${Date.now()}`,
      name: "New Service",
      description: "",
      estimatedTime: 0,
      price: 0
    };
    
    setSelectedJob(newJob);
    setIsCreatingJob(true);
  };
  
  // Filter categories based on search query
  const filteredCategories = searchQuery.trim() 
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.subcategories?.some(sub => 
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.jobs?.some(job => 
            job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      )
    : categories;
  
  // Handler for service editor save
  const handleSave = async (
    updatedCategory: ServiceMainCategory | null,
    updatedSubcategory: ServiceSubcategory | null,
    updatedJob: ServiceJob | null
  ) => {
    try {
      // Handle category update/creation
      if (updatedCategory) {
        if (isCreatingCategory) {
          // Adding a new category
          const savedCategory = await saveServiceCategory(updatedCategory);
          setCategories(prev => [...prev, savedCategory]);
          setSelectedCategory(savedCategory);
          setIsCreatingCategory(false);
          toast({
            title: "Success",
            description: `Category "${updatedCategory.name}" created successfully`,
          });
        } else {
          // Updating an existing category
          const categoryIndex = categories.findIndex(c => c.id === updatedCategory.id);
          if (categoryIndex !== -1) {
            const savedCategory = await saveServiceCategory(updatedCategory);
            setCategories(prev => [
              ...prev.slice(0, categoryIndex),
              savedCategory,
              ...prev.slice(categoryIndex + 1)
            ]);
            setSelectedCategory(savedCategory);
            toast({
              title: "Success",
              description: `Category "${updatedCategory.name}" updated successfully`,
            });
          }
        }
        return;
      }
      
      // Handle subcategory update/creation
      if (updatedSubcategory && selectedCategory) {
        const categoryIndex = categories.findIndex(c => c.id === selectedCategory.id);
        if (categoryIndex === -1) return;
        
        const updatedCategory = { ...categories[categoryIndex] };
        
        if (isCreatingSubcategory) {
          // Adding a new subcategory
          if (!updatedCategory.subcategories) updatedCategory.subcategories = [];
          updatedCategory.subcategories.push(updatedSubcategory);
          
          const savedCategory = await saveServiceCategory(updatedCategory);
          setCategories(prev => [
            ...prev.slice(0, categoryIndex),
            savedCategory,
            ...prev.slice(categoryIndex + 1)
          ]);
          setSelectedCategory(savedCategory);
          
          // Find the newly created subcategory in the saved category
          const newSubcat = savedCategory.subcategories?.find(
            sub => sub.name === updatedSubcategory.name
          );
          if (newSubcat) setSelectedSubcategory(newSubcat);
          
          setIsCreatingSubcategory(false);
          toast({
            title: "Success",
            description: `Subcategory "${updatedSubcategory.name}" created successfully`,
          });
        } else {
          // Updating an existing subcategory
          if (!updatedCategory.subcategories) return;
          
          const subcategoryIndex = updatedCategory.subcategories.findIndex(
            s => s.id === updatedSubcategory.id
          );
          if (subcategoryIndex === -1) return;
          
          updatedCategory.subcategories[subcategoryIndex] = updatedSubcategory;
          
          const savedCategory = await saveServiceCategory(updatedCategory);
          setCategories(prev => [
            ...prev.slice(0, categoryIndex),
            savedCategory,
            ...prev.slice(categoryIndex + 1)
          ]);
          setSelectedCategory(savedCategory);
          
          // Find the updated subcategory in the saved category
          const updatedSubcat = savedCategory.subcategories?.find(
            sub => sub.id === updatedSubcategory.id
          );
          if (updatedSubcat) setSelectedSubcategory(updatedSubcat);
          
          toast({
            title: "Success", 
            description: `Subcategory "${updatedSubcategory.name}" updated successfully`,
          });
        }
        return;
      }
      
      // Handle job update/creation
      if (updatedJob && selectedCategory && selectedSubcategory) {
        const categoryIndex = categories.findIndex(c => c.id === selectedCategory.id);
        if (categoryIndex === -1) return;
        
        const updatedCategory = { ...categories[categoryIndex] };
        if (!updatedCategory.subcategories) return;
        
        const subcategoryIndex = updatedCategory.subcategories.findIndex(
          s => s.id === selectedSubcategory.id
        );
        if (subcategoryIndex === -1) return;
        
        const updatedSubcategory = { ...updatedCategory.subcategories[subcategoryIndex] };
        if (!updatedSubcategory.jobs) updatedSubcategory.jobs = [];
        
        if (isCreatingJob) {
          // Adding a new job
          updatedSubcategory.jobs.push(updatedJob);
        } else {
          // Updating an existing job
          const jobIndex = updatedSubcategory.jobs.findIndex(j => j.id === updatedJob.id);
          if (jobIndex === -1) return;
          updatedSubcategory.jobs[jobIndex] = updatedJob;
        }
        
        updatedCategory.subcategories[subcategoryIndex] = updatedSubcategory;
        
        const savedCategory = await saveServiceCategory(updatedCategory);
        setCategories(prev => [
          ...prev.slice(0, categoryIndex),
          savedCategory,
          ...prev.slice(categoryIndex + 1)
        ]);
        setSelectedCategory(savedCategory);
        
        // Find the updated subcategory and job in the saved data
        const updatedSubcat = savedCategory.subcategories?.find(
          sub => sub.id === updatedSubcategory.id
        );
        if (updatedSubcat) {
          setSelectedSubcategory(updatedSubcat);
          
          // If creating a new job, find by name, otherwise find by ID
          if (isCreatingJob) {
            const newJob = updatedSubcat.jobs?.find(j => j.name === updatedJob.name);
            if (newJob) setSelectedJob(newJob);
            setIsCreatingJob(false);
          } else {
            const updatedJobInList = updatedSubcat.jobs?.find(j => j.id === updatedJob.id);
            if (updatedJobInList) setSelectedJob(updatedJobInList);
          }
        }
        
        toast({
          title: "Success",
          description: isCreatingJob 
            ? `Service "${updatedJob.name}" created successfully`
            : `Service "${updatedJob.name}" updated successfully`,
        });
      }
    } catch (error) {
      console.error("Error saving service data:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setSelectedCategory(undefined);
      setSelectedSubcategory(undefined);
      setSelectedJob(undefined);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };
  
  // Handle color change for a category
  const handleColorChange = (colorIndex: number) => {
    setCurrentColorIndex(colorIndex);
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    // The search query is already handled by the onQueryChange prop
    // which updates the searchQuery state directly
    // This function is kept for the onSearch prop requirement
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* Left column - Categories list */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Service Categories</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddCategory}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> New
              </Button>
            </div>
            
            <div className="mb-4">
              <ServiceSearchBar 
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Search services..."
              />
            </div>
            
            <ServiceCategoriesList 
              categories={filteredCategories}
              selectedCategoryId={selectedCategory?.id}
              onSelectCategory={handleSelectCategory}
              isLoading={loading}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Middle column - Subcategories and services */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardContent className="p-4">
            {selectedCategory ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Subcategories</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddSubcategory}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" /> New
                  </Button>
                </div>
                
                <div className="space-y-2 mb-6">
                  {selectedCategory.subcategories?.map(subcategory => (
                    <div 
                      key={subcategory.id}
                      className={`p-3 border rounded-md cursor-pointer ${
                        subcategory.id === selectedSubcategory?.id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectSubcategory(subcategory)}
                    >
                      <h4 className="font-medium text-sm">{subcategory.name}</h4>
                      {subcategory.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {subcategory.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {subcategory.jobs?.length || 0} services
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {selectedCategory.subcategories?.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded-md">
                      <p className="text-sm text-muted-foreground">No subcategories</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click "New" to create one
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedSubcategory && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Services</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddJob}
                        className="flex items-center gap-1"
                      >
                        <PlusCircle className="h-4 w-4" /> New
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {selectedSubcategory.jobs?.map(job => (
                        <div 
                          key={job.id}
                          className={`p-3 border rounded-md cursor-pointer ${
                            job.id === selectedJob?.id 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectJob(job)}
                        >
                          <h4 className="font-medium text-sm">{job.name}</h4>
                          {job.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {job.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              ${job.price?.toFixed(2) || '0.00'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {job.estimatedTime || 0} min
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {selectedSubcategory.jobs?.length === 0 && (
                        <div className="text-center p-4 border border-dashed rounded-md">
                          <p className="text-sm text-muted-foreground">No services</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click "New" to create one
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="text-sm text-muted-foreground">
                    Select a category to view subcategories
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Right column - Editor or analytics */}
      <div className="md:col-span-1 lg:col-span-2">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-grow">
            <Card className="h-full">
              <CardContent className="p-4">
                <ServiceEditor 
                  category={selectedCategory}
                  subcategory={selectedSubcategory}
                  job={selectedJob}
                  onSave={handleSave}
                  onDelete={handleDeleteCategory}
                  colorIndex={currentColorIndex}
                  onColorChange={handleColorChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ServiceAnalytics 
                categories={categories} 
              />
              <ServicesPriceReport 
                categories={categories}
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1"
              >
                <Upload className="h-4 w-4" /> Import Services
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bulk import modal */}
      <ServiceBulkImport 
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImportComplete={() => {
          // Refresh categories after import
          fetchServiceCategories().then(data => {
            setCategories(data);
            toast({
              title: "Import Complete",
              description: "Service categories have been imported successfully",
            });
          });
        }}
      />
    </div>
  );
};

export default ServiceHierarchyManager;
