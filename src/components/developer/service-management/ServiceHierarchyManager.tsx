
import React, { useState, useEffect } from 'react';
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob, 
  CategoryColorStyle 
} from '@/types/serviceHierarchy';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Upload, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ServiceCategoryList } from "./ServiceCategoryList";
import { ServiceCategoriesList } from "./hierarchy/ServiceCategoriesList";
import { ServiceEditor } from "./ServiceEditor";
import ServiceBulkImport from "./ServiceBulkImport";
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from "@/lib/services/serviceApi";
import { v4 as uuidv4 } from 'uuid';
import { serviceCategories as commonServiceCategories } from '@/data/commonServices';
import { 
  createEmptyCategory, 
  createEmptySubcategory, 
  createEmptyJob 
} from '@/lib/services/serviceUtils';

// Color palette for category tags
const categoryColors: CategoryColorStyle[] = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
];

// Get color style for a category
const getCategoryStyle = (
  categoryName: string, 
  categoryStyles: Record<string, CategoryColorStyle>
): CategoryColorStyle => {
  const lowerCaseName = categoryName.toLowerCase();
  const keys = Object.keys(categoryStyles);
  
  for (const key of keys) {
    if (lowerCaseName.includes(key)) {
      return categoryStyles[key];
    }
  }
  
  return categoryStyles["custom"] || {
    bg: "bg-slate-50",
    text: "text-slate-800",
    border: "border-slate-200",
  };
};

const defaultCategoryStyles: Record<string, CategoryColorStyle> = {
  "adjust": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  "basic": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  "brake": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  "cooling": { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-300" },
  "computer": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  "drive": { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  "electrical": { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
  "engine": { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
  "exhaust": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  "front": { bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-300" },
  "fuel": { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-300" },
  "heating": { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-300" },
  "misc": { bg: "bg-fuchsia-100", text: "text-fuchsia-800", border: "border-fuchsia-300" },
  "steering": { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300" },
  "transmission": { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-300" },
  "custom": { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" }
};

const ServiceHierarchyManager: React.FC = () => {
  // State for the service categories
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("editor");
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  
  // Color state for categories
  const [categoryStyles, setCategoryStyles] = useState<Record<string, CategoryColorStyle>>(
    defaultCategoryStyles
  );
  
  // Currently selected items
  const selectedCategory = selectedCategoryId 
    ? categories.find(c => c.id === selectedCategoryId) 
    : undefined;
  
  const selectedSubcategory = selectedSubcategoryId && selectedCategory?.subcategories 
    ? selectedCategory.subcategories.find(s => s.id === selectedSubcategoryId) 
    : undefined;
    
  const selectedJob = selectedJobId && selectedSubcategory?.jobs 
    ? selectedSubcategory.jobs.find(j => j.id === selectedJobId) 
    : undefined;

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchServiceCategories();
      setCategories(data);
      
      // Select the first category if there are any and none is selected
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
        
        // If the category has subcategories, select the first one
        if (data[0].subcategories && data[0].subcategories.length > 0) {
          setSelectedSubcategoryId(data[0].subcategories[0].id);
          
          // If the subcategory has jobs, select the first one
          if (data[0].subcategories[0].jobs && data[0].subcategories[0].jobs.length > 0) {
            setSelectedJobId(data[0].subcategories[0].jobs[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching service categories:', error);
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a category
  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
    setSelectedJobId(null);
    
    // If the category has subcategories, select the first one
    const category = categories.find(c => c.id === id);
    if (category?.subcategories && category.subcategories.length > 0) {
      setSelectedSubcategoryId(category.subcategories[0].id);
      
      // If the subcategory has jobs, select the first one
      if (category.subcategories[0].jobs && category.subcategories[0].jobs.length > 0) {
        setSelectedJobId(category.subcategories[0].jobs[0].id);
      }
    }
  };

  // Handle selecting a subcategory
  const handleSubcategorySelect = (id: string) => {
    setSelectedSubcategoryId(id);
    setSelectedJobId(null);
    
    // If the subcategory has jobs, select the first one
    const category = categories.find(c => c.id === selectedCategoryId);
    const subcategory = category?.subcategories?.find(s => s.id === id);
    if (subcategory?.jobs && subcategory.jobs.length > 0) {
      setSelectedJobId(subcategory.jobs[0].id);
    }
  };

  // Handle selecting a job
  const handleJobSelect = (id: string) => {
    setSelectedJobId(id);
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    const nextPosition = categories.length > 0 
      ? Math.max(...categories.map(c => c.position || 0)) + 1 
      : 0;
      
    const newCategory = createEmptyCategory(nextPosition);
    setCategories([...categories, newCategory]);
    setSelectedCategoryId(newCategory.id);
    setSelectedSubcategoryId(newCategory.subcategories?.[0].id || null);
    setSelectedJobId(null);
  };

  // Handle adding a subcategory to selected category
  const handleAddSubcategory = () => {
    if (!selectedCategoryId) return;
    
    const updatedCategories = categories.map(category => {
      if (category.id === selectedCategoryId) {
        const newSubcategory = createEmptySubcategory(false); // No initial job
        
        return {
          ...category,
          subcategories: [...(category.subcategories || []), newSubcategory]
        };
      }
      return category;
    });
    
    setCategories(updatedCategories);
    
    // Select the newly created subcategory
    const newSubcategory = updatedCategories
      .find(c => c.id === selectedCategoryId)
      ?.subcategories?.slice(-1)[0];
      
    if (newSubcategory) {
      setSelectedSubcategoryId(newSubcategory.id);
      setSelectedJobId(null);
    }
  };

  // Handle adding a job to selected subcategory
  const handleAddJob = () => {
    if (!selectedCategoryId || !selectedSubcategoryId) return;
    
    const updatedCategories = categories.map(category => {
      if (category.id === selectedCategoryId) {
        return {
          ...category,
          subcategories: (category.subcategories || []).map(subcategory => {
            if (subcategory.id === selectedSubcategoryId) {
              const newJob = createEmptyJob();
              return {
                ...subcategory,
                jobs: [...(subcategory.jobs || []), newJob]
              };
            }
            return subcategory;
          })
        };
      }
      return category;
    });
    
    setCategories(updatedCategories);
    
    // Select the newly created job
    const newJob = updatedCategories
      .find(c => c.id === selectedCategoryId)
      ?.subcategories?.find(s => s.id === selectedSubcategoryId)
      ?.jobs?.slice(-1)[0];
      
    if (newJob) {
      setSelectedJobId(newJob.id);
    }
  };

  // Handle saving item changes
  const handleSaveItem = async (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => {
    if (!selectedCategoryId && !category) return;
    
    let updatedCategories = [...categories];
    let saveTarget: ServiceMainCategory | undefined;
    
    if (job && selectedCategoryId && selectedSubcategoryId) {
      // Update job
      updatedCategories = categories.map(category => {
        if (category.id === selectedCategoryId) {
          saveTarget = {
            ...category,
            subcategories: (category.subcategories || []).map(subcategory => {
              if (subcategory.id === selectedSubcategoryId) {
                return {
                  ...subcategory,
                  jobs: (subcategory.jobs || []).map(j => 
                    j.id === job.id ? job : j
                  )
                };
              }
              return subcategory;
            })
          };
          return saveTarget;
        }
        return category;
      });
    } else if (subcategory && selectedCategoryId) {
      // Update subcategory
      updatedCategories = categories.map(category => {
        if (category.id === selectedCategoryId) {
          saveTarget = {
            ...category,
            subcategories: (category.subcategories || []).map(s => 
              s.id === subcategory.id ? subcategory : s
            )
          };
          return saveTarget;
        }
        return category;
      });
    } else if (category) {
      // Update category
      updatedCategories = categories.map(c => 
        c.id === category.id ? category : c
      );
      saveTarget = category;
    }
    
    if (saveTarget) {
      try {
        // Save to API
        await saveServiceCategory(saveTarget);
        setCategories(updatedCategories);
        
        toast({
          title: "Success",
          description: "Service item saved successfully",
        });
      } catch (error) {
        console.error('Error saving service item:', error);
        toast({
          title: "Error",
          description: "Failed to save service item",
          variant: "destructive",
        });
      }
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Delete from API
      await deleteServiceCategory(categoryId);
      
      // Update state
      setCategories(categories.filter(c => c.id !== categoryId));
      
      // Reset selection if the deleted category was selected
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        setSelectedSubcategoryId(null);
        setSelectedJobId(null);
      }
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  // Create sample categories from common services
  const handleCreateSample = async () => {
    try {
      // Convert common service categories to the correct format
      const sampleCategories: ServiceMainCategory[] = commonServiceCategories.map((cat, index) => ({
        id: uuidv4(),
        name: cat.name,
        description: `Common ${cat.name.toLowerCase()} services`,
        position: index,
        subcategories: cat.subcategories.map(sub => ({
          id: uuidv4(),
          name: sub.name,
          description: `${sub.name} services in ${cat.name}`,
          jobs: sub.services.map(service => ({
            id: uuidv4(),
            name: service,
            description: "",
            estimatedTime: 30,
            price: 0
          }))
        }))
      }));
      
      // Save each category to the API
      for (const category of sampleCategories) {
        await saveServiceCategory(category);
      }
      
      // Refresh categories
      await fetchCategories();
      
      toast({
        title: "Success",
        description: `Created ${sampleCategories.length} sample categories`,
      });
    } catch (error) {
      console.error('Error creating sample categories:', error);
      toast({
        title: "Error",
        description: "Failed to create sample categories",
        variant: "destructive",
      });
    }
  };

  // Get component based on current tab
  const getTabContent = () => {
    switch (currentTab) {
      case "editor":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Service categories and subcategories</CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceCategoriesList
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  selectedSubcategoryId={selectedSubcategoryId}
                  selectedJobId={selectedJobId}
                  onCategorySelect={handleCategorySelect}
                  onSubcategorySelect={handleSubcategorySelect}
                  onJobSelect={handleJobSelect}
                  isLoading={loading}
                  categoryStyles={categoryStyles}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddCategory} 
                    className="flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Category
                  </Button>
                  
                  {selectedCategoryId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddSubcategory} 
                      className="flex items-center"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Subcategory
                    </Button>
                  )}
                  
                  {selectedSubcategoryId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddJob} 
                      className="flex items-center"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Job
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Edit service information</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedJob && (
                  <ServiceEditor
                    category={undefined}
                    subcategory={undefined}
                    job={selectedJob}
                    onSave={handleSaveItem}
                  />
                )}
                
                {selectedSubcategory && !selectedJob && (
                  <ServiceEditor
                    category={undefined}
                    subcategory={selectedSubcategory}
                    job={undefined}
                    onSave={handleSaveItem}
                  />
                )}
                
                {selectedCategory && !selectedSubcategory && !selectedJob && (
                  <ServiceEditor
                    category={selectedCategory}
                    subcategory={undefined}
                    job={undefined}
                    onSave={handleSaveItem}
                    onDelete={handleDeleteCategory}
                  />
                )}
                
                {!selectedCategory && !selectedSubcategory && !selectedJob && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Select a service item from the list to edit
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case "import":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import</CardTitle>
                <CardDescription>
                  Import service categories from JSON file or create standard templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button 
                      onClick={() => setIsBulkImportOpen(true)} 
                      className="w-full flex items-center justify-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import from JSON
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      onClick={handleCreateSample} 
                      className="w-full flex items-center justify-center"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Sample Categories
                    </Button>
                  </div>
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      <p>
                        <strong>Bulk importing</strong> will merge new categories with existing ones.
                      </p>
                      <p className="mt-1">
                        <strong>Creating sample categories</strong> will add a standard set of
                        automotive service categories and subcategories.
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Categories</CardTitle>
                <CardDescription>
                  Download your service categories as a JSON file for backup or transfer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + 
                      encodeURIComponent(JSON.stringify(categories, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", "service_categories.json");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="w-full md:w-auto flex items-center justify-center"
                  disabled={categories.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Categories
                </Button>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Management</h2>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="editor">Service Editor</TabsTrigger>
            <TabsTrigger value="import">Import/Export</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div>
        {getTabContent()}
      </div>
      
      <ServiceBulkImport
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        onImportComplete={fetchCategories}
      />
    </div>
  );
};

export default ServiceHierarchyManager;
