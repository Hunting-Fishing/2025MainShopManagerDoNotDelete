
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';
import { ServiceEditor } from './ServiceEditor';
import { ServiceCategoriesList } from './hierarchy/ServiceCategoriesList';
import { ServiceSearchBar } from './hierarchy/ServiceSearchBar';
import { createEmptyCategory, sortCategoriesByPosition } from '@/lib/services/serviceUtils';
// Import other components
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import ServiceBulkImport from './ServiceBulkImport';

// Define the color style map for categories
const DEFAULT_COLOR_INDEX = 0;
const categoryColorMap = new Map<string, number>();

export default function ServiceHierarchyManager() {
  // State for categories and selection
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(DEFAULT_COLOR_INDEX);
  
  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);
  
  // Function to load categories from API
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchServiceCategories();
      const sortedCategories = sortCategoriesByPosition(data);
      
      // Initialize color mapping for each category
      sortedCategories.forEach(category => {
        if (!categoryColorMap.has(category.id)) {
          categoryColorMap.set(category.id, DEFAULT_COLOR_INDEX);
        }
      });
      
      setCategories(sortedCategories);
      setError(null);
    } catch (err: any) {
      setError(`Error loading service categories: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedJob(null);
    setSelectedColorIndex(categoryColorMap.get(category.id) || DEFAULT_COLOR_INDEX);
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedJob(null);
  };
  
  // Handle job selection
  const handleJobSelect = (job: ServiceJob) => {
    setSelectedJob(job);
  };
  
  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Add a new category
  const handleAddCategory = () => {
    const highestPosition = categories.reduce(
      (max, cat) => Math.max(max, cat.position || 0), 
      0
    );
    
    const newCategory = createEmptyCategory(highestPosition + 1);
    setCategories([...categories, newCategory]);
    setSelectedCategory(newCategory);
    setSelectedSubcategory(newCategory.subcategories?.[0] || null);
    setSelectedJob(null);
  };
  
  // Add a new subcategory to selected category
  const handleAddSubcategory = () => {
    if (!selectedCategory) return;
    
    const updatedCategory = { ...selectedCategory };
    const newSubcategory = {
      id: uuidv4(),
      name: 'New Subcategory',
      jobs: []
    };
    
    updatedCategory.subcategories = [
      ...(updatedCategory.subcategories || []),
      newSubcategory
    ];
    
    // Update categories array
    const updatedCategories = categories.map(cat => 
      cat.id === selectedCategory.id ? updatedCategory : cat
    );
    
    setCategories(updatedCategories);
    setSelectedCategory(updatedCategory);
    setSelectedSubcategory(newSubcategory);
    setSelectedJob(null);
  };
  
  // Add a new job to selected subcategory
  const handleAddJob = () => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    const newJob = {
      id: uuidv4(),
      name: 'New Service',
      price: 0,
      estimatedTime: 30
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
    
    // Update categories array
    const updatedCategories = categories.map(cat => 
      cat.id === selectedCategory.id ? updatedCategory : cat
    );
    
    setCategories(updatedCategories);
    setSelectedCategory(updatedCategory);
    setSelectedSubcategory(updatedSubcategory);
    setSelectedJob(newJob);
  };
  
  // Save all categories
  const handleSaveAll = async () => {
    try {
      // For simplicity, we'll just save the current selected category
      if (selectedCategory) {
        await saveServiceCategory(selectedCategory);
        loadCategories(); // Reload to get fresh data
      }
    } catch (err: any) {
      setError(`Error saving service category: ${err.message}`);
      console.error(err);
    }
  };
  
  // Handle saving changes to a category, subcategory, or job
  const handleSaveItem = async (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => {
    if (!selectedCategory) return;
    
    let updatedCategory = { ...selectedCategory };
    
    if (job && selectedSubcategory) {
      // Update a job
      const updatedSubcategory = {
        ...selectedSubcategory,
        jobs: selectedSubcategory.jobs?.map(j => j.id === job.id ? job : j)
      };
      
      updatedCategory = {
        ...updatedCategory,
        subcategories: updatedCategory.subcategories?.map(sub => 
          sub.id === updatedSubcategory.id ? updatedSubcategory : sub
        )
      };
    } else if (subcategory) {
      // Update a subcategory
      updatedCategory = {
        ...updatedCategory,
        subcategories: updatedCategory.subcategories?.map(sub => 
          sub.id === subcategory.id ? subcategory : sub
        )
      };
    } else if (category) {
      // Update a category
      updatedCategory = category;
    }
    
    try {
      await saveServiceCategory(updatedCategory);
      
      // Update local state
      const updatedCategories = categories.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      );
      
      setCategories(updatedCategories);
      setSelectedCategory(updatedCategory);
      
      // Update selectedSubcategory if it was the one that changed
      if (subcategory && selectedSubcategory?.id === subcategory.id) {
        const updatedSub = updatedCategory.subcategories?.find(
          sub => sub.id === subcategory.id
        );
        setSelectedSubcategory(updatedSub || null);
      }

      // Update selectedJob if it was the one that changed
      if (job && selectedJob?.id === job.id) {
        let updatedJob = null;
        updatedCategory.subcategories?.forEach(sub => {
          const foundJob = sub.jobs?.find(j => j.id === job.id);
          if (foundJob) updatedJob = foundJob;
        });
        setSelectedJob(updatedJob);
      }
      
    } catch (err: any) {
      setError(`Error saving service item: ${err.message}`);
      console.error(err);
    }
  };
  
  // Handle deletion of a category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      
      // Update local state
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      
      // Reset selection if the deleted category was selected
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setSelectedJob(null);
      }
      
    } catch (err: any) {
      setError(`Error deleting service category: ${err.message}`);
      console.error(err);
    }
  };
  
  // Handle color change for a category
  const handleColorChange = (colorIndex: number) => {
    if (!selectedCategory) return;
    
    // Store color selection in map
    categoryColorMap.set(selectedCategory.id, colorIndex);
    setSelectedColorIndex(colorIndex);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column - Categories list */}
      <div className="md:col-span-1 bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Service Categories</h2>
          <Button onClick={handleAddCategory} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        
        <ServiceSearchBar 
          onSearch={handleSearch}
          query={searchQuery} 
          onQueryChange={setSearchQuery} 
          placeholder="Search services..." 
        />
        
        <div className="mt-4">
          <ServiceCategoriesList 
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedJob={selectedJob}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            onJobSelect={handleJobSelect}
            searchQuery={searchQuery}
            isLoading={loading}
          />
        </div>
      </div>
      
      {/* Middle column - Editor */}
      <div className="md:col-span-2 bg-white rounded-xl shadow-md border border-gray-100">
        <Tabs defaultValue="editor" className="w-full">
          <div className="border-b px-4">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="import">Import/Export</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="editor" className="p-4 space-y-4">
            {selectedCategory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-x-2">
                    <Button 
                      onClick={handleAddSubcategory}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Subcategory
                    </Button>
                    
                    {selectedSubcategory && (
                      <Button 
                        onClick={handleAddJob}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Job
                      </Button>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSaveAll}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-1" /> Save All
                  </Button>
                </div>
                
                <ServiceEditor
                  category={selectedCategory}
                  subcategory={selectedSubcategory}
                  job={selectedJob}
                  onSave={handleSaveItem}
                  onDelete={handleDeleteCategory}
                  colorIndex={selectedColorIndex}
                  onColorChange={handleColorChange}
                />
              </div>
            )}
            
            {!selectedCategory && (
              <div className="text-center p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Selected</h3>
                <p className="text-gray-500 mb-4">Select a service from the list or create a new one.</p>
                <Button onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Category
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="p-4">
              <ServiceAnalytics categories={categories} />
            </div>
          </TabsContent>
          
          <TabsContent value="pricing">
            <div className="p-4">
              <ServicesPriceReport categories={categories} />
            </div>
          </TabsContent>
          
          <TabsContent value="import">
            <div className="p-4">
              <ServiceBulkImport onImportComplete={loadCategories} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
