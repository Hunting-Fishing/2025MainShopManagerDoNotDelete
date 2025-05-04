
import React, { useState, useEffect } from 'react';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload, Download, PlusCircle } from 'lucide-react';
import { ServiceEditor } from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import { ServiceCategoriesList } from './hierarchy/ServiceCategoriesList';
import { ServiceSearchBar } from './hierarchy/ServiceSearchBar';
import ServiceBulkImport from './ServiceBulkImport';
import { createEmptyCategory } from '@/lib/services/serviceUtils';

const ServiceHierarchyManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
      
      // Clear selections when reloading
      setSelectedCategory(undefined);
      setSelectedSubcategory(undefined);
      setSelectedJob(undefined);
    } catch (error) {
      console.error('Error loading service categories:', error);
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
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

  const handleSave = async (updatedCategory: ServiceMainCategory) => {
    try {
      await saveServiceCategory(updatedCategory);
      await loadCategories();
      toast({
        title: "Success",
        description: "Service category saved successfully",
      });
    } catch (error) {
      console.error('Error saving service category:', error);
      toast({
        title: "Error",
        description: "Failed to save service category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      await loadCategories();
      setSelectedCategory(undefined);
      setSelectedSubcategory(undefined);
      setSelectedJob(undefined);
      toast({
        title: "Success",
        description: "Service category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting service category:', error);
      toast({
        title: "Error",
        description: "Failed to delete service category",
        variant: "destructive",
      });
    }
  };

  const handleCreateCategory = () => {
    const newPosition = categories.length > 0 
      ? Math.max(...categories.map(c => c.position || 0)) + 1 
      : 1;
    
    const newCategory = createEmptyCategory(newPosition);
    setSelectedCategory(newCategory);
    setSelectedSubcategory(newCategory.subcategories?.[0]);
    setSelectedJob(newCategory.subcategories?.[0].jobs?.[0]);
  };

  const filteredCategories = searchQuery.trim() === '' 
    ? categories 
    : categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.subcategories?.some(sub => 
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.jobs?.some(job => 
            job.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      );

  const renderContent = () => {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="hierarchy" className="w-full">
          <TabsList className="bg-white rounded-lg p-1 border shadow-sm">
            <TabsTrigger value="hierarchy" className="text-sm">Line Codes</TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="pricing" className="text-sm">Pricing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hierarchy" className="mt-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  onClick={handleCreateCategory} 
                  className="flex items-center"
                  variant="outline"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                </Button>
                <Button 
                  onClick={() => setImportDialogOpen(true)}
                  className="ml-2 flex items-center"
                  variant="outline"
                >
                  <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              {/* First column: Categories */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium mb-3">Categories</h3>
                <ServiceSearchBar 
                  query={searchQuery} 
                  onQueryChange={setSearchQuery} 
                  placeholder="Search services..." 
                />
                <ScrollArea className="h-[500px] mt-3">
                  <ServiceCategoriesList 
                    categories={filteredCategories} 
                    selectedCategoryId={selectedCategory?.id} 
                    onSelectCategory={handleCategorySelect} 
                    isLoading={loading} 
                  />
                </ScrollArea>
              </div>
              
              {/* Second column: Subcategories (only shown when a category is selected) */}
              {selectedCategory && (
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium mb-3">
                    Subcategories: {selectedCategory.name}
                  </h3>
                  <ScrollArea className="h-[500px]">
                    {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 ? (
                      <div className="space-y-3">
                        {selectedCategory.subcategories.map((subcategory) => (
                          <div 
                            key={subcategory.id} 
                            className={`cursor-pointer p-3 rounded-xl border transition-colors ${
                              subcategory.id === selectedSubcategory?.id 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'hover:bg-slate-50 border-slate-200'
                            }`}
                            onClick={() => handleSubcategorySelect(subcategory)}
                          >
                            <h4 className="font-medium">{subcategory.name}</h4>
                            {subcategory.description && (
                              <p className="text-sm text-muted-foreground mt-1">{subcategory.description}</p>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {subcategory.jobs?.length || 0} jobs
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No subcategories available</p>
                    )}
                  </ScrollArea>
                </div>
              )}
              
              {/* Third column: Jobs (only shown when a subcategory is selected) */}
              {selectedSubcategory && (
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium mb-3">
                    Jobs: {selectedSubcategory.name}
                  </h3>
                  <ScrollArea className="h-[500px]">
                    {selectedSubcategory.jobs && selectedSubcategory.jobs.length > 0 ? (
                      <div className="space-y-3">
                        {selectedSubcategory.jobs.map((job) => (
                          <div 
                            key={job.id} 
                            className={`cursor-pointer p-3 rounded-xl border transition-colors ${
                              job.id === selectedJob?.id 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'hover:bg-slate-50 border-slate-200'
                            }`}
                            onClick={() => handleJobSelect(job)}
                          >
                            <h4 className="font-medium">{job.name}</h4>
                            {job.description && (
                              <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                            )}
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>Price: ${job.price?.toFixed(2) || '0.00'}</span>
                              <span>Time: {job.estimatedTime || 0} min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No jobs available</p>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Editor for the selected item */}
            {(selectedCategory || selectedSubcategory || selectedJob) && (
              <div className="mt-6">
                <ServiceEditor 
                  category={selectedCategory} 
                  subcategory={selectedSubcategory} 
                  job={selectedJob}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-4">
            <ServiceAnalytics categories={categories} />
          </TabsContent>
          
          <TabsContent value="pricing" className="mt-4">
            <ServicesPriceReport categories={categories} />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div>
      {loading && categories.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading service categories...</span>
        </div>
      ) : (
        renderContent()
      )}
      
      <ServiceBulkImport 
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={loadCategories}
      />
    </div>
  );
};

export default ServiceHierarchyManager;
