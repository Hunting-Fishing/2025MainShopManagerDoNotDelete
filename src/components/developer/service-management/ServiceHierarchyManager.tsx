import React, { useState, useEffect } from 'react';
import { fetchServiceCategories, saveServiceCategory } from '@/lib/services/serviceApi';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import ServiceBulkImport from './ServiceBulkImport';
import ServicesPriceReport from './ServicesPriceReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceEditor } from './ServiceEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { toast } from 'sonner';

// Define the search result type
interface SearchResult {
  type: 'category' | 'subcategory' | 'job';
  categoryId: string;
  subcategoryId?: string;
  item: ServiceMainCategory | ServiceSubcategory | ServiceJob;
  path: string;
}

export const ServiceHierarchyManager: React.FC = () => {
  // State for tracking selections
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [categoryColors, setCategoryColors] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch services data
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: fetchServiceCategories
  });

  // Initialize category colors
  useEffect(() => {
    if (categories) {
      const initialColors: Record<string, number> = {};
      categories.forEach((category, index) => {
        initialColors[category.id] = index % 15;
      });
      setCategoryColors(initialColors);
    }
  }, [categories]);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim() || !categories) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const results: SearchResult[] = [];
      const searchTermLower = searchTerm.toLowerCase();

      // Search through all categories, subcategories, and jobs
      categories.forEach(category => {
        // Search in category names
        if (category.name.toLowerCase().includes(searchTermLower)) {
          results.push({
            type: 'category',
            categoryId: category.id,
            item: category,
            path: category.name
          });
        }

        // Search in subcategories
        category.subcategories.forEach(subcategory => {
          if (subcategory.name.toLowerCase().includes(searchTermLower)) {
            results.push({
              type: 'subcategory',
              categoryId: category.id,
              subcategoryId: subcategory.id,
              item: subcategory,
              path: `${category.name} → ${subcategory.name}`
            });
          }

          // Search in jobs
          subcategory.jobs.forEach(job => {
            if (
              job.name.toLowerCase().includes(searchTermLower) || 
              (job.description && job.description.toLowerCase().includes(searchTermLower))
            ) {
              results.push({
                type: 'job',
                categoryId: category.id,
                subcategoryId: subcategory.id,
                item: job,
                path: `${category.name} → ${subcategory.name} → ${job.name}`
              });
            }
          });
        });
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, categories]);

  // Handle search result selection
  const handleSearchResultClick = (result: SearchResult) => {
    const category = categories?.find(c => c.id === result.categoryId) || null;
    setSelectedCategory(category);
    
    if (result.type === 'category') {
      setSelectedSubcategory(null);
      setSelectedJob(null);
    } else if (result.type === 'subcategory' && category) {
      const subcategory = category.subcategories.find(s => s.id === result.subcategoryId) || null;
      setSelectedSubcategory(subcategory);
      setSelectedJob(null);
    } else if (result.type === 'job' && category && result.subcategoryId) {
      const subcategory = category.subcategories.find(s => s.id === result.subcategoryId) || null;
      setSelectedSubcategory(subcategory);
      if (subcategory) {
        const job = subcategory.jobs.find(j => j.id === (result.item as ServiceJob).id) || null;
        setSelectedJob(job);
      }
    }
    
    setSearchTerm('');
    setSearchResults([]);
  };

  // Mutation for saving service categories
  const saveCategoryMutation = useMutation(
    (data: ServiceMainCategory | ServiceSubcategory | ServiceJob) => {
      if ('subcategories' in data) {
        return saveServiceCategory(data as ServiceMainCategory);
      } else {
        // Assuming subcategories and jobs are updated within the category
        return Promise.reject("Subcategory and job updates are not directly supported.");
      }
    },
    {
      onSuccess: () => {
        // Invalidate and refetch service categories
        queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
        toast.success('Service category saved successfully!');
      },
      onError: (error: any) => {
        toast.error(`Error saving service category: ${error.message}`);
      },
    }
  );

  // Handle save item
  const handleSaveItem = async (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => {
    if (category) {
      saveCategoryMutation.mutate(category);
    } else if (subcategory) {
      // Implement logic to update subcategory within its parent category
      // This might involve finding the category that contains this subcategory,
      // updating the subcategory within that category, and then saving the category.
      console.warn("Subcategory saving not yet implemented.");
      toast.warning("Subcategory saving not yet implemented.");
    } else if (job) {
      // Implement logic to update job within its parent subcategory
      // Similar to subcategory, find the subcategory and category that contain this job,
      // update the job within that subcategory, and then save the category.
      console.warn("Job saving not yet implemented.");
      toast.warning("Job saving not yet implemented.");
    }
  };

  // Handle color change
  const handleColorChange = (colorIndex: number) => {
    if (!selectedCategory) return;
    
    const newCategoryColors = { ...categoryColors };
    newCategoryColors[selectedCategory.id] = colorIndex;
    setCategoryColors(newCategoryColors);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading services...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Failed to load services</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['serviceCategories'] })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search component */}
      <div className="relative">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <Search className="h-5 w-5 ml-3 text-gray-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories, subcategories, and services..."
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {isSearching && <Loader2 className="h-4 w-4 animate-spin mr-3" />}
          {searchTerm && !isSearching && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSearchTerm('')}
              className="h-8 w-8 mr-2"
            >
              ×
            </Button>
          )}
        </div>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <ul className="py-1">
              {searchResults.map((result, index) => (
                <li
                  key={`${result.type}-${index}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSearchResultClick(result)}
                >
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      result.type === 'category' ? 'bg-blue-500' :
                      result.type === 'subcategory' ? 'bg-purple-500' :
                      'bg-green-500'
                    }`}></span>
                    <div>
                      <p className="text-sm font-medium">
                        {result.type === 'category' 
                          ? (result.item as ServiceMainCategory).name 
                          : result.type === 'subcategory'
                            ? (result.item as ServiceSubcategory).name
                            : (result.item as ServiceJob).name}
                      </p>
                      <p className="text-xs text-gray-500">{result.path}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {searchTerm && searchResults.length === 0 && !isSearching && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-3 text-center">
            <p className="text-gray-500">No results found for "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Browser */}
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle>Service Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="browser">
              <TabsList className="mb-4 bg-white rounded-full p-1 border shadow-sm">
                <TabsTrigger value="browser" className="rounded-full text-sm px-4 py-2">Browser</TabsTrigger>
                <TabsTrigger value="bulk-import" className="rounded-full text-sm px-4 py-2">Bulk Import</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-full text-sm px-4 py-2">Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browser">
                <ServiceHierarchyBrowser
                  categories={categories || []}
                  onSelectCategory={setSelectedCategory}
                  onSelectSubcategory={setSelectedSubcategory}
                  onSelectJob={setSelectedJob}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  selectedJob={selectedJob}
                  categoryColors={categoryColors}
                />
              </TabsContent>
              
              <TabsContent value="bulk-import">
                <ServiceBulkImport />
              </TabsContent>
              
              <TabsContent value="reports">
                <ServicesPriceReport categories={categories || []} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Service Editor */}
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle>
              {selectedCategory || selectedSubcategory || selectedJob ? 'Edit Selected Item' : 'Service Editor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceEditor
              category={selectedCategory || undefined}
              subcategory={selectedSubcategory || undefined}
              job={selectedJob || undefined}
              onSave={handleSaveItem}
              colorIndex={selectedCategory ? categoryColors[selectedCategory.id] : 0}
              onColorChange={handleColorChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
