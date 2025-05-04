
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import ServiceEditor from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import ServiceBulkImport from './ServiceBulkImport';
import { parseExcelData, exportToExcel } from '@/lib/services/excelParser';
import { v4 as uuidv4 } from 'uuid';
import { handleApiError } from '@/utils/errorHandling';

interface ServiceHierarchyState {
  categories: ServiceMainCategory[];
  selectedCategory: ServiceMainCategory | null;
  selectedSubcategory: ServiceSubcategory | null;
  selectedJob: ServiceJob | null;
  isEditing: boolean;
  isLoading: boolean;
  activeTab: string;
}

const ServiceHierarchyManager: React.FC = () => {
  const [state, setState] = useState<ServiceHierarchyState>({
    categories: [],
    selectedCategory: null,
    selectedSubcategory: null,
    selectedJob: null,
    isEditing: false,
    isLoading: false,
    activeTab: 'hierarchy'
  });

  // Load mock data for development
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true
    }));

    // In a real app, this would be an API call
    // For now, we're just using mock data
    setTimeout(() => {
      const mockData = [
        {
          id: '1',
          name: 'Oil Changes',
          description: 'All types of oil change services',
          position: 0,
          subcategories: [
            {
              id: '1-1',
              name: 'Synthetic Oil',
              description: 'Synthetic oil changes',
              jobs: [
                {
                  id: '1-1-1',
                  name: 'Full Synthetic Oil Change',
                  description: 'Complete oil change with full synthetic oil',
                  price: 79.99,
                  estimatedTime: 45
                },
                {
                  id: '1-1-2',
                  name: 'Synthetic Blend Oil Change',
                  description: 'Oil change using synthetic blend oil',
                  price: 59.99,
                  estimatedTime: 30
                }
              ]
            },
            {
              id: '1-2',
              name: 'Conventional Oil',
              description: 'Conventional oil changes',
              jobs: [
                {
                  id: '1-2-1',
                  name: 'Basic Oil Change',
                  description: 'Standard oil change with conventional oil',
                  price: 39.99,
                  estimatedTime: 30
                }
              ]
            }
          ]
        },
        {
          id: '2',
          name: 'Brakes',
          description: 'Brake repair and maintenance services',
          position: 1,
          subcategories: [
            {
              id: '2-1',
              name: 'Brake Pads',
              description: 'Brake pad replacement',
              jobs: [
                {
                  id: '2-1-1',
                  name: 'Front Brake Pads',
                  description: 'Replace front brake pads',
                  price: 149.99,
                  estimatedTime: 75
                },
                {
                  id: '2-1-2',
                  name: 'Rear Brake Pads',
                  description: 'Replace rear brake pads',
                  price: 139.99,
                  estimatedTime: 75
                },
                {
                  id: '2-1-3',
                  name: 'Complete Brake Pad Replacement',
                  description: 'Replace all brake pads',
                  price: 269.99,
                  estimatedTime: 120
                }
              ]
            }
          ]
        }
      ] as ServiceMainCategory[];

      setState(prev => ({
        ...prev,
        categories: mockData,
        isLoading: false
      }));
    }, 500);
  }, []);

  const handleCategorySelect = (category: ServiceMainCategory) => {
    setState(prev => ({
      ...prev,
      selectedCategory: category,
      selectedSubcategory: null,
      selectedJob: null
    }));
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setState(prev => ({
      ...prev,
      selectedSubcategory: subcategory,
      selectedJob: null
    }));
  };

  const handleJobSelect = (job: ServiceJob) => {
    setState(prev => ({
      ...prev,
      selectedJob: job
    }));
  };

  const handleAddCategory = () => {
    setState(prev => ({
      ...prev,
      selectedCategory: null,
      selectedSubcategory: null,
      selectedJob: null,
      isEditing: true
    }));
  };

  const handleAddSubcategory = () => {
    if (!state.selectedCategory) return;
    setState(prev => ({
      ...prev,
      selectedSubcategory: null,
      selectedJob: null,
      isEditing: true
    }));
  };

  const handleAddJob = () => {
    if (!state.selectedCategory || !state.selectedSubcategory) return;
    setState(prev => ({
      ...prev,
      selectedJob: null,
      isEditing: true
    }));
  };

  const handleEdit = () => {
    setState(prev => ({
      ...prev,
      isEditing: true
    }));
  };

  const handleCancel = () => {
    setState(prev => ({
      ...prev,
      isEditing: false
    }));
  };

  const handleSave = (data: any) => {
    let updatedCategories = [...state.categories];
    
    if (state.selectedJob) {
      // Update job
      updatedCategories = updatedCategories.map(category => {
        if (category.id === state.selectedCategory?.id) {
          return {
            ...category,
            subcategories: category.subcategories.map(sub => {
              if (sub.id === state.selectedSubcategory?.id) {
                return {
                  ...sub,
                  jobs: sub.jobs.map(job => 
                    job.id === state.selectedJob?.id ? { ...job, ...data } : job
                  )
                };
              }
              return sub;
            })
          };
        }
        return category;
      });
      toast({
        title: "Service updated",
        description: `Service "${data.name}" has been updated.`,
      });
    } else if (state.selectedSubcategory) {
      // Update subcategory
      updatedCategories = updatedCategories.map(category => {
        if (category.id === state.selectedCategory?.id) {
          return {
            ...category,
            subcategories: category.subcategories.map(sub => 
              sub.id === state.selectedSubcategory?.id ? { ...sub, ...data } : sub
            )
          };
        }
        return category;
      });
      toast({
        title: "Subcategory updated",
        description: `Subcategory "${data.name}" has been updated.`,
      });
    } else if (state.selectedCategory) {
      // Update category
      updatedCategories = updatedCategories.map(category => 
        category.id === state.selectedCategory.id ? { ...category, ...data } : category
      );
      toast({
        title: "Category updated",
        description: `Category "${data.name}" has been updated.`,
      });
    } else {
      // Add new category
      updatedCategories.push({
        id: uuidv4(),
        name: data.name,
        description: data.description || '',
        position: updatedCategories.length,
        subcategories: []
      });
      toast({
        title: "Category added",
        description: `New category "${data.name}" has been created.`,
      });
    }
    
    setState(prev => ({
      ...prev,
      categories: updatedCategories,
      isEditing: false
    }));
  };

  const handleDelete = () => {
    let updatedCategories = [...state.categories];
    let message = '';
    
    if (state.selectedJob) {
      // Delete job
      updatedCategories = updatedCategories.map(category => {
        if (category.id === state.selectedCategory?.id) {
          return {
            ...category,
            subcategories: category.subcategories.map(sub => {
              if (sub.id === state.selectedSubcategory?.id) {
                return {
                  ...sub,
                  jobs: sub.jobs.filter(job => job.id !== state.selectedJob?.id)
                };
              }
              return sub;
            })
          };
        }
        return category;
      });
      message = `Service "${state.selectedJob.name}" has been deleted.`;
    } else if (state.selectedSubcategory) {
      // Delete subcategory
      updatedCategories = updatedCategories.map(category => {
        if (category.id === state.selectedCategory?.id) {
          return {
            ...category,
            subcategories: category.subcategories.filter(sub => sub.id !== state.selectedSubcategory?.id)
          };
        }
        return category;
      });
      message = `Subcategory "${state.selectedSubcategory.name}" has been deleted.`;
    } else if (state.selectedCategory) {
      // Delete category
      updatedCategories = updatedCategories.filter(category => category.id !== state.selectedCategory.id);
      message = `Category "${state.selectedCategory.name}" has been deleted.`;
    }
    
    toast({
      title: "Deleted successfully",
      description: message,
    });
    
    setState(prev => ({
      ...prev,
      categories: updatedCategories,
      selectedCategory: null,
      selectedSubcategory: null,
      selectedJob: null
    }));
  };

  const handleExportServices = () => {
    try {
      exportToExcel(state.categories, 'service-hierarchy-export');
      toast({
        title: "Export completed",
        description: "Service hierarchy has been exported to Excel.",
      });
    } catch (error) {
      handleApiError(error, "Failed to export services");
    }
  };

  const handleImportServices = async (file: File) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const importedCategories = await parseExcelData(file);
      
      setState(prev => ({
        ...prev,
        categories: importedCategories,
        isLoading: false
      }));
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${importedCategories.length} service categories.`,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      handleApiError(error, "Failed to import services");
    }
  };

  const handleTabChange = (value: string) => {
    setState(prev => ({
      ...prev,
      activeTab: value
    }));
  };

  const renderHierarchyView = () => {
    if (state.isEditing) {
      return (
        <ServiceEditor
          selectedCategory={state.selectedCategory}
          selectedSubcategory={state.selectedSubcategory}
          selectedJob={state.selectedJob}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Categories Column */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Categories</CardTitle>
            <Button size="sm" onClick={handleAddCategory}>Add Category</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.categories.map(category => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`p-2 rounded cursor-pointer ${
                    state.selectedCategory?.id === category.id
                      ? 'bg-blue-100 border-l-4 border-blue-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-gray-500">
                    {category.subcategories.length} subcategories
                  </p>
                </div>
              ))}
              {state.categories.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No categories found</p>
                  <Button size="sm" onClick={handleAddCategory}>Add First Category</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subcategories Column */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Subcategories</CardTitle>
            <Button 
              size="sm" 
              onClick={handleAddSubcategory}
              disabled={!state.selectedCategory}
            >
              Add Subcategory
            </Button>
          </CardHeader>
          <CardContent>
            {!state.selectedCategory ? (
              <div className="text-center py-6">
                <p className="text-gray-500">Select a category first</p>
              </div>
            ) : (
              <div className="space-y-2">
                {state.selectedCategory.subcategories.map(subcategory => (
                  <div
                    key={subcategory.id}
                    onClick={() => handleSubcategorySelect(subcategory)}
                    className={`p-2 rounded cursor-pointer ${
                      state.selectedSubcategory?.id === subcategory.id
                        ? 'bg-purple-100 border-l-4 border-purple-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-medium">{subcategory.name}</p>
                    <p className="text-xs text-gray-500">
                      {subcategory.jobs.length} services
                    </p>
                  </div>
                ))}
                {state.selectedCategory.subcategories.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No subcategories found</p>
                    <Button size="sm" onClick={handleAddSubcategory}>
                      Add First Subcategory
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Column */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Services</CardTitle>
            <Button 
              size="sm" 
              onClick={handleAddJob}
              disabled={!state.selectedSubcategory}
            >
              Add Service
            </Button>
          </CardHeader>
          <CardContent>
            {!state.selectedSubcategory ? (
              <div className="text-center py-6">
                <p className="text-gray-500">Select a subcategory first</p>
              </div>
            ) : (
              <div className="space-y-2">
                {state.selectedSubcategory.jobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => handleJobSelect(job)}
                    className={`p-2 rounded cursor-pointer ${
                      state.selectedJob?.id === job.id
                        ? 'bg-green-100 border-l-4 border-green-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between">
                      <p className="font-medium">{job.name}</p>
                      <p className="font-medium text-green-600">
                        ${job.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {job.estimatedTime || 0} minutes
                    </p>
                  </div>
                ))}
                {state.selectedSubcategory.jobs.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No services found</p>
                    <Button size="sm" onClick={handleAddJob}>
                      Add First Service
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render action buttons based on selection
  const renderActionButtons = () => {
    if (state.isEditing) return null;
    
    let entity = 'item';
    if (state.selectedJob) entity = 'service';
    else if (state.selectedSubcategory) entity = 'subcategory';
    else if (state.selectedCategory) entity = 'category';
    
    const isSelected = state.selectedCategory || state.selectedSubcategory || state.selectedJob;
    
    if (!isSelected) return null;
    
    return (
      <div className="flex gap-2 mt-4">
        <Button onClick={handleEdit} variant="outline">
          Edit {entity}
        </Button>
        <Button onClick={handleDelete} variant="destructive">
          Delete {entity}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Service Management</h1>
          <p className="text-gray-500">Manage service categories, subcategories, and jobs</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <ServiceBulkImport 
            onFileUpload={handleImportServices} 
            isLoading={state.isLoading} 
          />
          <Button variant="outline" onClick={handleExportServices}>
            Export Services
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hierarchy" value={state.activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="hierarchy">Service Hierarchy</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Price Analysis</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="hierarchy">
            {renderHierarchyView()}
            {renderActionButtons()}
          </TabsContent>
          
          <TabsContent value="analytics">
            <ServiceAnalytics categories={state.categories} />
          </TabsContent>
          
          <TabsContent value="pricing">
            <ServicesPriceReport categories={state.categories} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ServiceHierarchyManager;
