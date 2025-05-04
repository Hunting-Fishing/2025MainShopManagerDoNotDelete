
import React, { useState, useEffect } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/use-toast";
import { Loader2, Upload, Download, PlusCircle } from 'lucide-react';
import { ServiceEditor } from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import ServicesPriceReport from './ServicesPriceReport';
import { ServiceCategoriesList } from './hierarchy/ServiceCategoriesList';
import ServiceBulkImport from './ServiceBulkImport';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';
import { createEmptyCategory } from '@/lib/services/serviceUtils';
import { ServiceSearchBar } from './hierarchy/ServiceSearchBar';

export default function ServiceHierarchyManager() {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | undefined>();
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | undefined>();
  const [selectedJob, setSelectedJob] = useState<ServiceJob | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("line-codes");
  const [selectedCategoryColorIndex, setSelectedCategoryColorIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter categories when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      category.subcategories?.some(sub => 
        sub.name.toLowerCase().includes(query) ||
        sub.description?.toLowerCase().includes(query) ||
        sub.jobs?.some(job => 
          job.name.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
        )
      )
    );
    
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
      setFilteredCategories(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading service categories:', error);
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddCategory = () => {
    const maxPosition = Math.max(0, ...categories.map(cat => cat.position || 0));
    const newCategory = createEmptyCategory(maxPosition + 1);
    setSelectedCategory(newCategory);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
  };

  const handleSelectCategory = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
  };

  const handleSave = async (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => {
    if (!selectedCategory) return;
    
    let updatedCategory = { ...selectedCategory };
    
    // Handle job update
    if (job && selectedSubcategory) {
      const subcategoryIndex = updatedCategory.subcategories?.findIndex(s => s.id === selectedSubcategory.id) ?? -1;
      if (subcategoryIndex !== -1 && updatedCategory.subcategories) {
        const jobIndex = updatedCategory.subcategories[subcategoryIndex].jobs?.findIndex(j => j.id === job.id) ?? -1;
        if (jobIndex !== -1 && updatedCategory.subcategories[subcategoryIndex].jobs) {
          updatedCategory.subcategories[subcategoryIndex].jobs![jobIndex] = job;
        } else if (updatedCategory.subcategories[subcategoryIndex].jobs) {
          updatedCategory.subcategories[subcategoryIndex].jobs = [...updatedCategory.subcategories[subcategoryIndex].jobs!, job];
        } else {
          updatedCategory.subcategories[subcategoryIndex].jobs = [job];
        }
      }
    }
    
    // Handle subcategory update
    else if (subcategory) {
      const subcategoryIndex = updatedCategory.subcategories?.findIndex(s => s.id === subcategory.id) ?? -1;
      if (subcategoryIndex !== -1 && updatedCategory.subcategories) {
        updatedCategory.subcategories[subcategoryIndex] = subcategory;
      } else if (updatedCategory.subcategories) {
        updatedCategory.subcategories = [...updatedCategory.subcategories, subcategory];
      } else {
        updatedCategory.subcategories = [subcategory];
      }
    }
    
    // Handle category update
    else if (category) {
      updatedCategory = category;
    }
    
    try {
      setIsLoading(true);
      const savedCategory = await saveServiceCategory(updatedCategory);
      
      // Update the categories list
      setCategories(prev => {
        const index = prev.findIndex(c => c.id === savedCategory.id);
        if (index !== -1) {
          const updatedCategories = [...prev];
          updatedCategories[index] = savedCategory;
          return updatedCategories;
        } else {
          return [...prev, savedCategory];
        }
      });
      
      setSelectedCategory(savedCategory);
      toast({
        title: "Success",
        description: "Service hierarchy updated successfully",
      });
    } catch (error) {
      console.error('Error saving service category:', error);
      toast({
        title: "Error",
        description: "Failed to save service hierarchy",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorChange = (colorIndex: number) => {
    setSelectedCategoryColorIndex(colorIndex);
  };

  const handleRefresh = () => {
    loadCategories();
  };

  const handleImportComplete = () => {
    loadCategories();
    setShowBulkImport(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-8 space-y-6">
        <Tabs defaultValue="line-codes" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white rounded-full p-1 border shadow-sm mb-4">
            <TabsTrigger value="line-codes" className="rounded-full text-sm px-4 py-2">
              Line Codes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full text-sm px-4 py-2">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="price-report" className="rounded-full text-sm px-4 py-2">
              Price Report
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="line-codes" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <ServiceSearchBar onSearch={handleSearch} />
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                  Refresh
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkImport(true)}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddCategory}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <ServiceCategoriesList
                  categories={filteredCategories}
                  selectedCategoryId={selectedCategory?.id}
                  onSelectCategory={handleSelectCategory}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <ServiceAnalytics categories={categories} />
          </TabsContent>
          
          <TabsContent value="price-report">
            <ServicesPriceReport categories={categories} />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="lg:col-span-4">
        <Card className="h-full">
          <CardContent className="p-6">
            <ServiceEditor
              category={selectedCategory}
              subcategory={selectedSubcategory}
              job={selectedJob}
              onSave={handleSave}
              colorIndex={selectedCategoryColorIndex}
              onColorChange={handleColorChange}
            />
          </CardContent>
        </Card>
      </div>

      <ServiceBulkImport 
        open={showBulkImport}
        onOpenChange={setShowBulkImport}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
