
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from '@/types/serviceHierarchy';
import { parseExcelData } from '@/lib/services/excelParser';
import { createEmptyCategory } from '@/lib/services/serviceUtils';

import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { ServiceEditor } from './ServiceEditor';
import ServiceAnalytics from './ServiceAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileSpreadsheet, 
  List, 
  PlusCircle 
} from 'lucide-react';
import ServicesPriceReport from './ServicesPriceReport';
import ServiceBulkImport from './ServiceBulkImport';

const ServiceHierarchyManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [activeTab, setActiveTab] = useState('browser');
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to add a new category
  const handleAddCategory = () => {
    const newCategory = createEmptyCategory(categories.length);
    setCategories([...categories, newCategory]);
    setSelectedCategory(newCategory);
    setSelectedSubcategory(null);
    setSelectedJob(null);
    toast({
      title: "Category Added",
      description: "New category has been created successfully."
    });
  };

  // Function to handle file upload for bulk import
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Parse the data from the Excel file
          const data = JSON.parse(e.target?.result as string);
          const parsedCategories = parseExcelData(data);
          
          if (parsedCategories.length > 0) {
            setCategories([...categories, ...parsedCategories]);
            toast({
              title: "Import Successful",
              description: `Imported ${parsedCategories.length} categories with services.`
            });
          } else {
            toast({
              title: "Import Warning",
              description: "No valid service data found in the file.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error parsing data:", error);
          toast({
            title: "Import Failed",
            description: "Failed to parse the Excel data. Please check the file format.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Import Failed",
          description: "Failed to read the file. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Import Failed",
        description: "An error occurred during import. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Handle category update
  const handleCategoryUpdate = (updatedCategory: ServiceMainCategory) => {
    setCategories(categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
    setSelectedCategory(updatedCategory);
    toast({
      title: "Category Updated",
      description: "Category has been updated successfully."
    });
  };
  
  // Handle category delete
  const handleCategoryDelete = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedJob(null);
    toast({
      title: "Category Deleted",
      description: "Category has been deleted successfully."
    });
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: ServiceSubcategory, parentCategory: ServiceMainCategory) => {
    setSelectedCategory(parentCategory);
    setSelectedSubcategory(subcategory);
    setSelectedJob(null);
  };
  
  // Handle job selection
  const handleJobSelect = (job: ServiceJob, parentSubcategory: ServiceSubcategory, parentCategory: ServiceMainCategory) => {
    setSelectedCategory(parentCategory);
    setSelectedSubcategory(parentSubcategory);
    setSelectedJob(job);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Management</h1>
        <p className="text-gray-600">
          Manage service categories, subcategories, and jobs with their prices and estimated times
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-blue-50 p-1">
          <TabsTrigger value="browser" className="data-[state=active]:bg-white">
            <List className="mr-2 h-4 w-4" />
            Service Browser
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-white">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Price Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browser" className="space-y-6">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleAddCategory} 
                className="mr-2 bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
              <ServiceBulkImport onFileUpload={handleFileUpload} isLoading={isLoading} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Service Hierarchy</CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceHierarchyBrowser
                  categories={categories}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  selectedJob={selectedJob}
                  onCategorySelect={setSelectedCategory}
                  onSubcategorySelect={handleSubcategorySelect}
                  onJobSelect={handleJobSelect}
                  onCategoryDelete={handleCategoryDelete}
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {selectedJob ? 'Edit Service' : 
                   selectedSubcategory ? 'Edit Subcategory' : 
                   selectedCategory ? 'Edit Category' : 
                   'Select an item to edit'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceEditor
                  categories={categories}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  selectedJob={selectedJob}
                  onCategoryUpdate={handleCategoryUpdate}
                  onCategoriesChange={setCategories}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <ServiceAnalytics categories={categories} />
        </TabsContent>

        <TabsContent value="pricing">
          <ServicesPriceReport categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceHierarchyManager;
