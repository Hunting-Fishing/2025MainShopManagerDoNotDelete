
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Search, Tag, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { ServiceEditor } from './ServiceEditor';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';
import { deepClone, createEmptyCategory, sortCategoriesByPosition } from '@/lib/services/serviceUtils';
import ServiceBulkImport from './ServiceBulkImport';
import { CategoryColorStyle } from './ServiceEditor'; // Import the type from ServiceEditor

interface SearchResult {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'job';
  path: string;
  parentId?: string;
  category?: ServiceMainCategory;
  subcategory?: ServiceSubcategory;
  job?: ServiceJob;
}

const ServiceHierarchyManager: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [categoryColors, setCategoryColors] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // Fetch service categories
  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: fetchServiceCategories
  });

  // Sort categories by position
  const sortedCategories = useMemo(() => {
    return sortCategoriesByPosition([...categories]);
  }, [categories]);

  // Save mutation
  const saveServiceMutation = useMutation({
    mutationFn: async (data: { 
      category: ServiceMainCategory | null; 
      subcategory: ServiceSubcategory | null; 
      job: ServiceJob | null;
    }) => {
      const { category, subcategory, job } = data;
      if (category) {
        const savedCategory = await saveServiceCategory(category);
        return savedCategory;
      }
      // For subcategory or job, we need to save the parent category
      if (subcategory && selectedCategory) {
        const categoryToUpdate = deepClone(selectedCategory);
        const subcategoryIndex = categoryToUpdate.subcategories.findIndex(sc => sc.id === subcategory.id);
        if (subcategoryIndex >= 0) {
          categoryToUpdate.subcategories[subcategoryIndex] = subcategory;
        }
        const savedCategory = await saveServiceCategory(categoryToUpdate);
        return savedCategory;
      }
      if (job && selectedCategory && selectedSubcategory) {
        const categoryToUpdate = deepClone(selectedCategory);
        const subcategoryIndex = categoryToUpdate.subcategories.findIndex(sc => sc.id === selectedSubcategory.id);
        if (subcategoryIndex >= 0) {
          const jobIndex = categoryToUpdate.subcategories[subcategoryIndex].jobs.findIndex(j => j.id === job.id);
          if (jobIndex >= 0) {
            categoryToUpdate.subcategories[subcategoryIndex].jobs[jobIndex] = job;
          }
        }
        const savedCategory = await saveServiceCategory(categoryToUpdate);
        return savedCategory;
      }
      throw new Error('Invalid data to save');
    },
    onSuccess: (data) => {
      toast.success('Changes saved successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error saving changes: ${error.message}`);
    }
  });

  // Handle save
  const handleSave = (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => {
    saveServiceMutation.mutate({ category, subcategory, job });
  };

  // Handle color change
  const handleColorChange = (colorIndex: number) => {
    if (selectedCategory) {
      const updatedColors = { ...categoryColors };
      updatedColors[selectedCategory.id] = colorIndex;
      setCategoryColors(updatedColors);
    }
  };

  // Updates search results when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];
    
    // Search through all categories, subcategories and jobs
    sortedCategories.forEach(category => {
      if (category.name.toLowerCase().includes(query)) {
        results.push({
          id: category.id,
          name: category.name,
          type: 'category',
          path: category.name,
          category
        });
      }
      
      category.subcategories.forEach(subcategory => {
        if (subcategory.name.toLowerCase().includes(query)) {
          results.push({
            id: subcategory.id,
            name: subcategory.name,
            type: 'subcategory',
            path: `${category.name} > ${subcategory.name}`,
            parentId: category.id,
            category,
            subcategory
          });
        }
        
        subcategory.jobs.forEach(job => {
          if (job.name.toLowerCase().includes(query)) {
            results.push({
              id: job.id,
              name: job.name,
              type: 'job',
              path: `${category.name} > ${subcategory.name} > ${job.name}`,
              parentId: subcategory.id,
              category,
              subcategory,
              job
            });
          }
        });
      });
    });
    
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, [searchQuery, sortedCategories]);

  // Handle search result selection
  const handleSearchResultClick = (result: SearchResult) => {
    if (result.type === 'category' && result.category) {
      setSelectedCategory(result.category);
      setSelectedSubcategory(null);
      setSelectedJob(null);
    } else if (result.type === 'subcategory' && result.category && result.subcategory) {
      setSelectedCategory(result.category);
      setSelectedSubcategory(result.subcategory);
      setSelectedJob(null);
    } else if (result.type === 'job' && result.category && result.subcategory && result.job) {
      setSelectedCategory(result.category);
      setSelectedSubcategory(result.subcategory);
      setSelectedJob(result.job);
    }
    
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Handle import completion
  const handleImportComplete = (importedCategories: ServiceMainCategory[]) => {
    setShowImportDialog(false);
    refetch();
    toast.success(`Successfully imported ${importedCategories.length} service categories`);
  };

  // Handle bulk import cancel
  const handleImportCancel = () => {
    setShowImportDialog(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white shadow-md rounded-xl border border-gray-100 md:h-[calc(100vh-200px)] overflow-hidden">
        <CardContent className="p-4 h-full">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Service Hierarchy</h2>
              <div className="flex gap-2">
                <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Services
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Import Services</AlertDialogTitle>
                    {showImportDialog && <ServiceBulkImport 
                      onCancel={handleImportCancel} 
                      onComplete={handleImportComplete} 
                    />}
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="relative mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search services, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {showSearchResults && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result) => (
                    <div 
                      key={`${result.type}-${result.id}`}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="flex items-center gap-2">
                        {result.type === 'category' && <Tag className="h-4 w-4 text-indigo-600" />}
                        {result.type === 'subcategory' && <Circle className="h-3 w-3 text-blue-500" />}
                        {result.type === 'job' && <span className="w-4 h-4 flex justify-center text-sm text-gray-500">-</span>}
                        <span className="font-medium">{result.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">{result.type}</span>
                      </div>
                      <span className="text-xs text-gray-500 ml-6">{result.path}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="categories" className="h-full">
                <TabsList className="bg-white">
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="categories" className="h-full overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Categories list component would go here */}
                      {/* This is a placeholder for the actual categories browser component */}
                      <div className="p-4 text-center text-gray-500">
                        Please implement the service hierarchy browser component
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden md:h-[calc(100vh-200px)]">
        <CardContent className="p-4 h-full overflow-y-auto">
          <ServiceEditor
            category={selectedCategory || undefined}
            subcategory={selectedSubcategory || undefined}
            job={selectedJob || undefined}
            onSave={handleSave}
            categoryColors={DEFAULT_COLOR_STYLES}
            colorIndex={selectedCategory ? (categoryColors[selectedCategory.id] || 0) : 0}
            onColorChange={handleColorChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Use the DEFAULT_COLOR_STYLES from ServiceEditor
const { DEFAULT_COLOR_STYLES } = require('./ServiceEditor');

export default ServiceHierarchyManager;
