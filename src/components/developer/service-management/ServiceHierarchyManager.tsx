
import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchServiceCategories, 
  saveServiceCategory, 
  deleteServiceCategory 
} from '@/lib/services/serviceApi';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Download, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ServiceEditor, { DEFAULT_COLOR_STYLES, CategoryColorStyle } from './ServiceEditor';
import { ServiceCategoriesList } from './hierarchy/ServiceCategoriesList';
import { ServiceSearchBar } from './hierarchy/ServiceSearchBar';
import ServiceBulkImport from './ServiceBulkImport';
import { exportToExcel } from '@/lib/services/excelParser';

const ServiceHierarchyManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | undefined>();
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  // Get the selected items based on their IDs
  const selectedCategory = selectedCategoryId 
    ? categories.find(cat => cat.id === selectedCategoryId) 
    : undefined;
  
  const selectedSubcategory = selectedCategory && selectedSubcategoryId
    ? selectedCategory.subcategories?.find(sub => sub.id === selectedSubcategoryId)
    : undefined;
  
  const selectedJob = selectedSubcategory && selectedJobId
    ? selectedSubcategory.jobs?.find(job => job.id === selectedJobId)
    : undefined;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategorySelect = (category: ServiceMainCategory) => {
    setSelectedCategoryId(category.id);
    setSelectedSubcategoryId(undefined);
    setSelectedJobId(undefined);
    
    // Set color index based on category position
    const index = category.position % DEFAULT_COLOR_STYLES.length;
    setColorIndex(index);
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategoryId(subcategory.id);
    setSelectedJobId(undefined);
  };

  const handleJobSelect = (job: ServiceJob) => {
    setSelectedJobId(job.id);
  };

  const handleAddCategory = () => {
    // Get highest position number
    const maxPosition = categories.reduce(
      (max, category) => Math.max(max, category.position || 0), 
      0
    );
    
    const newCategory: ServiceMainCategory = {
      id: crypto.randomUUID(),
      name: 'New Category',
      description: '',
      position: maxPosition + 1,
      subcategories: []
    };
    
    setCategories(prev => [...prev, newCategory]);
    handleCategorySelect(newCategory);
  };

  const handleAddSubcategory = () => {
    if (!selectedCategory) return;
    
    const newSubcategory: ServiceSubcategory = {
      id: crypto.randomUUID(),
      name: 'New Subcategory',
      description: '',
      jobs: []
    };
    
    const updatedCategory = {
      ...selectedCategory,
      subcategories: [...(selectedCategory.subcategories || []), newSubcategory]
    };
    
    setCategories(prev =>
      prev.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat)
    );
    
    handleSubcategorySelect(newSubcategory);
  };

  const handleAddJob = () => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    const newJob: ServiceJob = {
      id: crypto.randomUUID(),
      name: 'New Service',
      description: '',
      estimatedTime: 30,
      price: 0
    };
    
    const updatedSubcategory = {
      ...selectedSubcategory,
      jobs: [...(selectedSubcategory.jobs || []), newJob]
    };
    
    const updatedCategory = {
      ...selectedCategory,
      subcategories: selectedCategory.subcategories?.map(sub => 
        sub.id === selectedSubcategory.id ? updatedSubcategory : sub
      )
    };
    
    setCategories(prev =>
      prev.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat)
    );
    
    handleJobSelect(newJob);
  };

  const handleSaveItem = async (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => {
    if (!selectedCategory) return;

    let updatedCategory: ServiceMainCategory;
    
    if (category) {
      // Saving main category
      updatedCategory = { ...category };
      
      try {
        await saveServiceCategory(updatedCategory);
        setCategories(prev => prev.map(cat => cat.id === category.id ? updatedCategory : cat));
        toast({
          title: "Success",
          description: "Category saved successfully"
        });
      } catch (error) {
        console.error("Error saving category:", error);
        toast({
          title: "Error",
          description: "Failed to save category",
          variant: "destructive"
        });
      }
    } else if (subcategory) {
      // Saving subcategory
      updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories?.map(sub => 
          sub.id === subcategory.id ? subcategory : sub
        )
      };
      
      try {
        await saveServiceCategory(updatedCategory);
        setCategories(prev => 
          prev.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat)
        );
        toast({
          title: "Success",
          description: "Subcategory saved successfully"
        });
      } catch (error) {
        console.error("Error saving subcategory:", error);
        toast({
          title: "Error",
          description: "Failed to save subcategory",
          variant: "destructive"
        });
      }
    } else if (job && selectedSubcategory) {
      // Saving job
      const updatedSubcategory = {
        ...selectedSubcategory,
        jobs: selectedSubcategory.jobs?.map(j => j.id === job.id ? job : j)
      };
      
      updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories?.map(sub => 
          sub.id === updatedSubcategory.id ? updatedSubcategory : sub
        )
      };
      
      try {
        await saveServiceCategory(updatedCategory);
        setCategories(prev => 
          prev.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat)
        );
        toast({
          title: "Success",
          description: "Service saved successfully"
        });
      } catch (error) {
        console.error("Error saving service:", error);
        toast({
          title: "Error",
          description: "Failed to save service",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteServiceCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      setSelectedCategoryId(undefined);
      setSelectedSubcategoryId(undefined);
      setSelectedJobId(undefined);
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset selection if searching
    if (query && query !== searchQuery) {
      setSelectedCategoryId(undefined);
      setSelectedSubcategoryId(undefined);
      setSelectedJobId(undefined);
    }
  };

  const handleExport = () => {
    try {
      exportToExcel(categories);
      toast({
        title: "Success",
        description: "Services exported successfully"
      });
    } catch (error) {
      console.error("Error exporting services:", error);
      toast({
        title: "Error",
        description: "Failed to export services",
        variant: "destructive"
      });
    }
  };

  const handleColorChange = (index: number) => {
    setColorIndex(index);
  };
  
  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? categories.filter(category => {
        const categoryMatch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
        const subcategoryMatch = category.subcategories?.some(
          sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const jobMatch = category.subcategories?.some(
          sub => sub.jobs?.some(
            job => job.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
        
        return categoryMatch || subcategoryMatch || jobMatch;
      })
    : categories;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left panel - Category list */}
      <div className="lg:w-1/3">
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Service Categories</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkImportOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <ServiceSearchBar 
                onSearch={handleSearch}
                query={searchQuery}
                onQueryChange={setSearchQuery}
              />
            </div>
            
            <div className="mb-4 max-h-[60vh] overflow-y-auto">
              <ServiceCategoriesList 
                categories={filteredCategories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={handleCategorySelect}
                isLoading={isLoading}
              />
            </div>
            
            <Button 
              variant="outline" 
              className="w-full border-dashed"
              onClick={handleAddCategory}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Category
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Right panel - Subcategories, Jobs, and Editor */}
      <div className="lg:w-2/3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Category Panel */}
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="overflow-y-auto max-h-[30vh]">
                {filteredCategories.map(category => (
                  <Button
                    key={category.id}
                    variant={category.id === selectedCategoryId ? "default" : "ghost"}
                    className={`w-full justify-start mb-1 ${
                      category.id === selectedCategoryId ? 'bg-blue-600' : ''
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-2 border-dashed"
                onClick={handleAddCategory}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>
          
          {/* Subcategory Panel */}
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Subcategories</h3>
              <div className="overflow-y-auto max-h-[30vh]">
                {selectedCategory?.subcategories?.map(subcategory => (
                  <Button
                    key={subcategory.id}
                    variant={subcategory.id === selectedSubcategoryId ? "default" : "ghost"}
                    className={`w-full justify-start mb-1 ${
                      subcategory.id === selectedSubcategoryId ? 'bg-blue-600' : ''
                    }`}
                    onClick={() => handleSubcategorySelect(subcategory)}
                  >
                    {subcategory.name}
                  </Button>
                ))}
                {selectedCategory && selectedCategory.subcategories?.length === 0 && (
                  <p className="text-sm text-gray-500">No subcategories</p>
                )}
              </div>
              {selectedCategory && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-dashed"
                  onClick={handleAddSubcategory}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Subcategory
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Job Panel */}
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Services</h3>
              <div className="overflow-y-auto max-h-[30vh]">
                {selectedSubcategory?.jobs?.map(job => (
                  <Button
                    key={job.id}
                    variant={job.id === selectedJobId ? "default" : "ghost"}
                    className={`w-full justify-start mb-1 ${
                      job.id === selectedJobId ? 'bg-blue-600' : ''
                    }`}
                    onClick={() => handleJobSelect(job)}
                  >
                    {job.name}
                  </Button>
                ))}
                {selectedSubcategory && (!selectedSubcategory.jobs || selectedSubcategory.jobs.length === 0) && (
                  <p className="text-sm text-gray-500">No services</p>
                )}
              </div>
              {selectedSubcategory && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-dashed"
                  onClick={handleAddJob}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Editor */}
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardContent className="p-6">
            <ServiceEditor
              category={selectedCategory}
              subcategory={selectedSubcategory}
              job={selectedJob}
              onSave={handleSaveItem}
              onDelete={handleDeleteCategory}
              categoryColors={DEFAULT_COLOR_STYLES}
              colorIndex={colorIndex}
              onColorChange={handleColorChange}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Bulk Import Dialog */}
      <ServiceBulkImport 
        open={isBulkImportOpen} 
        onOpenChange={setIsBulkImportOpen} 
        onImportComplete={fetchData} 
      />
    </div>
  );
};

export default ServiceHierarchyManager;
