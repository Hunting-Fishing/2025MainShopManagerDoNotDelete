
import React, { useState, useEffect } from 'react';
import { 
  AlertDialog, AlertDialogContent, 
  AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ServiceMainCategory, ServiceSubcategory, ServiceJob 
} from '@/types/serviceHierarchy';
import { 
  fetchServiceCategories, saveServiceCategory, deleteServiceCategory 
} from '@/lib/services/serviceApi';
import ServiceEditor, { CategoryColorStyle } from './ServiceEditor';
import { createEmptyCategory, sortCategoriesByPosition } from '@/lib/services/serviceUtils';
import ServiceBulkImport from './ServiceBulkImport';

const ServiceHierarchyManager: React.FC = () => {
  // State variables
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [categoryColorMap, setCategoryColorMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{
    type: 'category' | 'subcategory' | 'service',
    item: ServiceMainCategory | ServiceSubcategory | ServiceJob,
    path: string
  }>>([]);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  
  // Default colors
  const categoryColors: CategoryColorStyle[] = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
    { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
    { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
    { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' }
  ];
  
  const queryClient = useQueryClient();
  
  // Query service categories
  const { 
    data: categories = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['serviceCategories'], 
    queryFn: fetchServiceCategories
  });

  // Sort categories by position
  const sortedCategories = sortCategoriesByPosition([...categories]);
  
  // Save category mutation
  const saveCategory = useMutation({
    mutationFn: (category: ServiceMainCategory) => saveServiceCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
    }
  });
  
  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: (id: string) => deleteServiceCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSelectedJob(null);
    }
  });
  
  // Add a new category
  const handleAddCategory = () => {
    const newPosition = sortedCategories.length > 0 
      ? Math.max(...sortedCategories.map(cat => cat.position || 0)) + 1 
      : 0;
    
    const newCategory = createEmptyCategory(newPosition);
    setSelectedCategory(newCategory);
    setSelectedSubcategory(null);
    setSelectedJob(null);
  };
  
  // Add a new subcategory to the selected category
  const handleAddSubcategory = () => {
    if (!selectedCategory) return;
    
    const updatedCategory = { 
      ...selectedCategory,
      subcategories: [
        ...selectedCategory.subcategories, 
        {
          id: Math.random().toString(36).substring(2, 9),
          name: 'New Subcategory',
          description: '',
          jobs: []
        }
      ]
    };
    
    saveCategory.mutate(updatedCategory);
    
    const newSubcategory = updatedCategory.subcategories[updatedCategory.subcategories.length - 1];
    setSelectedCategory(updatedCategory);
    setSelectedSubcategory(newSubcategory);
    setSelectedJob(null);
  };
  
  // Add a new job to the selected subcategory
  const handleAddJob = () => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    const updatedSubcategories = selectedCategory.subcategories.map(sub => 
      sub.id === selectedSubcategory.id ? {
        ...sub,
        jobs: [
          ...sub.jobs,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: 'New Service',
            description: '',
            estimatedTime: 30,
            price: 0
          }
        ]
      } : sub
    );
    
    const updatedCategory = { 
      ...selectedCategory,
      subcategories: updatedSubcategories
    };
    
    saveCategory.mutate(updatedCategory);
    
    const updatedSubcategory = updatedSubcategories.find(sub => sub.id === selectedSubcategory.id);
    if (updatedSubcategory) {
      const newJob = updatedSubcategory.jobs[updatedSubcategory.jobs.length - 1];
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(updatedSubcategory);
      setSelectedJob(newJob);
    }
  };
  
  // Handle color changes for categories
  const handleCategoryColorChange = (categoryId: string, colorIndex: number) => {
    setCategoryColorMap(prev => ({
      ...prev,
      [categoryId]: colorIndex
    }));
  };
  
  // Get color index for a category
  const getCategoryColorIndex = (categoryId: string): number => {
    return categoryColorMap[categoryId] !== undefined ? 
      categoryColorMap[categoryId] : 
      Math.abs(categoryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % categoryColors.length;
  };
  
  // Handle selection of items
  const handleSelectCategory = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedJob(null);
  };
  
  const handleSelectSubcategory = (category: ServiceMainCategory, subcategory: ServiceSubcategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedJob(null);
  };
  
  const handleSelectJob = (category: ServiceMainCategory, subcategory: ServiceSubcategory, job: ServiceJob) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedJob(job);
  };
  
  // Handle deletion of items
  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category and all its subcategories?')) {
      deleteCategory.mutate(categoryId);
    }
  };
  
  const handleDeleteSubcategory = (subcategoryId: string) => {
    if (!selectedCategory) return;
    
    if (window.confirm('Are you sure you want to delete this subcategory and all its jobs?')) {
      const updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories.filter(sub => sub.id !== subcategoryId)
      };
      
      saveCategory.mutate(updatedCategory);
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(null);
      setSelectedJob(null);
    }
  };
  
  const handleDeleteJob = (jobId: string) => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    if (window.confirm('Are you sure you want to delete this job?')) {
      const updatedSubcategories = selectedCategory.subcategories.map(sub => 
        sub.id === selectedSubcategory.id ? {
          ...sub,
          jobs: sub.jobs.filter(job => job.id !== jobId)
        } : sub
      );
      
      const updatedCategory = {
        ...selectedCategory,
        subcategories: updatedSubcategories
      };
      
      saveCategory.mutate(updatedCategory);
      
      const updatedSubcategory = updatedSubcategories.find(sub => sub.id === selectedSubcategory.id);
      if (updatedSubcategory) {
        setSelectedCategory(updatedCategory);
        setSelectedSubcategory(updatedSubcategory);
        setSelectedJob(null);
      }
    }
  };
  
  // Handle saving edited items
  const handleSaveItem = (
    updatedCategory: ServiceMainCategory | null,
    updatedSubcategory: ServiceSubcategory | null,
    updatedJob: ServiceJob | null
  ) => {
    if (!selectedCategory) return;
    
    let newCategory = { ...selectedCategory };
    
    if (updatedCategory && !updatedSubcategory && !updatedJob) {
      newCategory = { ...updatedCategory };
    }
    
    if (updatedSubcategory && selectedSubcategory) {
      newCategory.subcategories = newCategory.subcategories.map(sub => 
        sub.id === selectedSubcategory.id ? updatedSubcategory : sub
      );
    }
    
    if (updatedJob && selectedSubcategory && selectedJob) {
      newCategory.subcategories = newCategory.subcategories.map(sub => 
        sub.id === selectedSubcategory.id ? {
          ...sub,
          jobs: sub.jobs.map(job => job.id === selectedJob.id ? updatedJob : job)
        } : sub
      );
    }
    
    saveCategory.mutate(newCategory);
    
    if (updatedCategory) setSelectedCategory(updatedCategory);
    if (updatedSubcategory) setSelectedSubcategory(updatedSubcategory);
    if (updatedJob) setSelectedJob(updatedJob);
  };

  // Search functionality
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = value.toLowerCase();
    const results: Array<{
      type: 'category' | 'subcategory' | 'service',
      item: ServiceMainCategory | ServiceSubcategory | ServiceJob,
      path: string
    }> = [];
    
    // Search in categories
    sortedCategories.forEach(category => {
      if (category.name.toLowerCase().includes(query)) {
        results.push({ 
          type: 'category', 
          item: category, 
          path: category.name 
        });
      }
      
      // Search in subcategories
      category.subcategories.forEach(subcategory => {
        if (subcategory.name.toLowerCase().includes(query)) {
          results.push({ 
            type: 'subcategory', 
            item: subcategory, 
            path: `${category.name} > ${subcategory.name}` 
          });
        }
        
        // Search in jobs
        subcategory.jobs.forEach(job => {
          if (job.name.toLowerCase().includes(query)) {
            results.push({ 
              type: 'service', 
              item: job, 
              path: `${category.name} > ${subcategory.name} > ${job.name}` 
            });
          }
        });
      });
    });
    
    setSearchResults(results);
  };
  
  // Handle search result selection
  const handleSelectSearchResult = (result: {
    type: 'category' | 'subcategory' | 'service',
    item: ServiceMainCategory | ServiceSubcategory | ServiceJob,
    path: string
  }) => {
    // Find and select the corresponding items
    if (result.type === 'category') {
      const category = sortedCategories.find(c => c.id === (result.item as ServiceMainCategory).id);
      if (category) {
        handleSelectCategory(category);
      }
    } else if (result.type === 'subcategory') {
      const subcategoryItem = result.item as ServiceSubcategory;
      const category = sortedCategories.find(c => 
        c.subcategories.some(sub => sub.id === subcategoryItem.id)
      );
      
      if (category) {
        const subcategory = category.subcategories.find(s => s.id === subcategoryItem.id);
        if (subcategory) {
          handleSelectSubcategory(category, subcategory);
        }
      }
    } else if (result.type === 'service') {
      const jobItem = result.item as ServiceJob;
      let foundCategory: ServiceMainCategory | undefined;
      let foundSubcategory: ServiceSubcategory | undefined;
      
      for (const category of sortedCategories) {
        for (const subcategory of category.subcategories) {
          const job = subcategory.jobs.find(j => j.id === jobItem.id);
          if (job) {
            foundCategory = category;
            foundSubcategory = subcategory;
            handleSelectJob(category, subcategory, job);
            break;
          }
        }
        if (foundCategory && foundSubcategory) break;
      }
    }
    
    // Clear search after selection
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Handle import completion
  const handleImportComplete = (importedCategories: ServiceMainCategory[]) => {
    setShowImportDialog(false);
    queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
  };

  // If loading, show loading message
  if (isLoading) {
    return <div className="p-4">Loading service hierarchy...</div>;
  }
  
  // If error, show error message
  if (error) {
    return <div className="p-4 text-red-500">Error loading service data: {error.toString()}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left side: Categories browser */}
      <div className="lg:col-span-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <h2 className="text-lg font-semibold">Services</h2>
          <div className="ml-auto flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => setShowImportDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Import
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddCategory}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Category
            </Button>
          </div>
        </div>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
          
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                  onClick={() => handleSelectSearchResult(result)}
                >
                  <div className="flex items-center">
                    <span className="text-xs px-2 py-0.5 rounded-full mr-2 bg-gray-200">
                      {result.type === 'category' ? 'Category' : 
                       result.type === 'subcategory' ? 'Subcategory' : 'Service'}
                    </span>
                    <span className="font-medium">
                      {(result.item as any).name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{result.path}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Categories list */}
        <div className="space-y-4">
          {sortedCategories.map(category => (
            <div key={category.id} className="border rounded-lg overflow-hidden">
              <div 
                className={`p-2 flex items-center justify-between cursor-pointer ${
                  selectedCategory?.id === category.id ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                onClick={() => handleSelectCategory(category)}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      categoryColors[getCategoryColorIndex(category.id)].bg
                    } ${categoryColors[getCategoryColorIndex(category.id)].border}`}
                  ></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSubcategory();
                    }}
                    disabled={selectedCategory?.id !== category.id}
                  >
                    +
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              {/* Subcategories */}
              {category.subcategories.length > 0 && selectedCategory?.id === category.id && (
                <div className="pl-4 bg-white">
                  {category.subcategories.map(subcategory => (
                    <div key={subcategory.id}>
                      <div 
                        className={`p-2 flex items-center justify-between cursor-pointer border-t ${
                          selectedSubcategory?.id === subcategory.id ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => handleSelectSubcategory(category, subcategory)}
                      >
                        <span>{subcategory.name}</span>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSubcategory(category, subcategory);
                              handleAddJob();
                            }}
                            disabled={selectedSubcategory?.id !== subcategory.id}
                          >
                            +
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubcategory(subcategory.id);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                      
                      {/* Jobs */}
                      {subcategory.jobs.length > 0 && selectedSubcategory?.id === subcategory.id && (
                        <div className="pl-4 bg-white">
                          {subcategory.jobs.map(job => (
                            <div 
                              key={job.id}
                              className={`p-2 flex items-center justify-between cursor-pointer border-t ${
                                selectedJob?.id === job.id ? 'bg-gray-50' : ''
                              }`}
                              onClick={() => handleSelectJob(category, subcategory, job)}
                            >
                              <div>
                                <span>{job.name}</span>
                                {job.price !== undefined && (
                                  <span className="ml-2 text-sm text-gray-600">${job.price.toFixed(2)}</span>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteJob(job.id);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {sortedCategories.length === 0 && (
            <div className="text-center p-4 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No services defined yet.</p>
              <p className="text-sm mt-2">Click "Add Category" to create your first service category.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Right side: Editor */}
      <div className="lg:col-span-8 bg-white p-4 rounded-lg border shadow-sm">
        {selectedCategory ? (
          <ServiceEditor 
            category={selectedCategory}
            subcategory={selectedSubcategory || undefined}
            job={selectedJob || undefined}
            onSave={handleSaveItem}
            categoryColors={categoryColors}
            colorIndex={selectedCategory ? getCategoryColorIndex(selectedCategory.id) : 0}
            onColorChange={(index) => {
              if (selectedCategory) {
                handleCategoryColorChange(selectedCategory.id, index);
              }
            }}
          />
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Please select a service item to edit</p>
            <p className="text-sm mt-2 text-gray-400">Or add a new category using the button on the left</p>
          </div>
        )}
      </div>
      
      {/* Import dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Import Services</AlertDialogTitle>
          </AlertDialogHeader>
          <ServiceBulkImport 
            onCancel={() => setShowImportDialog(false)} 
            onComplete={handleImportComplete} 
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceHierarchyManager;
