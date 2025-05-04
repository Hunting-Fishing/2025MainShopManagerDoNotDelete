
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { fetchServiceCategories, deleteServiceCategory, saveServiceCategory } from '@/lib/services/serviceApi';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Upload, Download, PlusCircle } from 'lucide-react';
import { ServiceEditor } from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import { ServiceCategoriesList } from './hierarchy/ServiceCategoriesList';
import ServiceBulkImport from './ServiceBulkImport';
import { createEmptyCategory } from '@/lib/services/serviceUtils';

interface ServiceHierarchyManagerProps {
  // Add props if needed
}

const ServiceHierarchyManager: React.FC<ServiceHierarchyManagerProps> = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'analytics' | 'report'>('categories');
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Update selected category when selectedCategoryId changes
  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find(c => c.id === selectedCategoryId);
      setSelectedCategory(category || null);
      // Reset subcategory and job when category changes
      setSelectedSubcategory(null);
      setSelectedJob(null);
    } else {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSelectedJob(null);
    }
  }, [selectedCategoryId, categories]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
      // If no category was selected but we have categories, select the first one
      if (!selectedCategoryId && data.length > 0) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading service categories:', error);
      toast({
        title: 'Error loading service categories',
        description: 'Failed to load service categories. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSelectCategory = (category: ServiceMainCategory) => {
    setSelectedCategoryId(category.id);
    setSelectedSubcategory(null);
    setSelectedJob(null);
  };

  const handleSelectSubcategory = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedJob(null);
  };

  const handleSelectJob = (job: ServiceJob) => {
    setSelectedJob(job);
  };

  const handleAddCategory = async () => {
    try {
      // Create a new category with position at the end
      const nextPosition = categories.length > 0 
        ? Math.max(...categories.map(c => c.position)) + 1 
        : 0;
      
      const newCategory = createEmptyCategory(nextPosition);
      
      // Save the new category to the database
      const savedCategory = await saveServiceCategory(newCategory);
      
      // Update local state
      setCategories(prev => [...prev, savedCategory]);
      setSelectedCategoryId(savedCategory.id);
      
      toast({
        title: "Category added",
        description: "New service category has been created",
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error adding category',
        description: 'Failed to add new category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkImportComplete = () => {
    // Reload categories after bulk import
    loadCategories();
    setBulkImportOpen(false);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <ServiceAnalytics />;
      case 'report':
        return <ServicesPriceReport />;
      default:
        return (
          <div className="flex space-x-4 h-[600px]">
            {/* Column 1: Categories List */}
            <div className="w-1/3 border rounded-md p-4 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Categories</h3>
                <Button size="sm" onClick={handleAddCategory} className="ml-auto">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="h-[540px] overflow-y-auto">
                <ServiceCategoriesList
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={handleSelectCategory}
                  isLoading={loadingCategories}
                />
              </div>
            </div>

            {/* Column 2: Subcategories */}
            {selectedCategory && (
              <div className="w-1/3 border rounded-md p-4 bg-white">
                <h3 className="text-lg font-medium mb-4">Subcategories - {selectedCategory.name}</h3>
                <div className="h-[540px] overflow-y-auto">
                  {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCategory.subcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className={`rounded-xl border cursor-pointer transition-colors shadow-sm p-3 ${
                            selectedSubcategory?.id === subcategory.id
                              ? 'bg-blue-50 border-blue-200 shadow-md'
                              : 'hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => handleSelectSubcategory(subcategory)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{subcategory.name}</h4>
                              {subcategory.description && (
                                <p className="text-xs text-muted-foreground mt-1">{subcategory.description}</p>
                              )}
                              <div className="flex items-center mt-2">
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 border border-blue-300">
                                  {subcategory.jobs?.length || 0} jobs
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border border-dashed rounded-md">
                      <p className="text-sm text-muted-foreground">No subcategories available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Column 3: Jobs */}
            {selectedSubcategory && (
              <div className="w-1/3 border rounded-md p-4 bg-white">
                <h3 className="text-lg font-medium mb-4">Jobs - {selectedSubcategory.name}</h3>
                <div className="h-[540px] overflow-y-auto">
                  {selectedSubcategory.jobs && selectedSubcategory.jobs.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSubcategory.jobs.map((job) => (
                        <div
                          key={job.id}
                          className={`rounded-xl border cursor-pointer transition-colors shadow-sm p-3 ${
                            selectedJob?.id === job.id
                              ? 'bg-green-50 border-green-200 shadow-md'
                              : 'hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => handleSelectJob(job)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{job.name}</h4>
                              {job.description && (
                                <p className="text-xs text-muted-foreground mt-1">{job.description}</p>
                              )}
                              <div className="flex items-center mt-2 space-x-2">
                                {job.estimatedTime && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-300">
                                    {Math.floor(job.estimatedTime / 60)}h {job.estimatedTime % 60}m
                                  </span>
                                )}
                                {job.price !== undefined && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 border border-green-300">
                                    ${job.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border border-dashed rounded-md">
                      <p className="text-sm text-muted-foreground">No jobs available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
            size="sm"
          >
            Line Codes
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            size="sm"
          >
            Analytics
          </Button>
          <Button
            variant={activeTab === 'report' ? 'default' : 'outline'}
            onClick={() => setActiveTab('report')}
            size="sm"
          >
            Price Report
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>
      </div>
      
      {renderContent()}

      <ServiceBulkImport 
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onImportComplete={handleBulkImportComplete}
      />

      {/* Editor will be added in a future iteration */}
    </div>
  );
};

export default ServiceHierarchyManager;
