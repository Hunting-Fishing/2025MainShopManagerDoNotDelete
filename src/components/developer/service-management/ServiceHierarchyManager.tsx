
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, FileSpreadsheet } from 'lucide-react';
import { fetchServiceCategories, saveServiceCategory } from '@/lib/services/serviceApi';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceEditor } from './ServiceEditor';
import ServiceBulkImport from './ServiceBulkImport';
import ServicesPriceReport from './ServicesPriceReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categoryColors = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
];

export const ServiceHierarchyManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState(undefined);
  const [selectedJob, setSelectedJob] = useState(undefined);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  
  // Track selected IDs for highlighting in the browser
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Track category colors to persist between rerenders
  const [categoryColorMap, setCategoryColorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      console.log("Fetching service categories...");
      const data = await fetchServiceCategories();
      console.log("Fetched categories:", data);
      setCategories(data);
      initializeCategoryColors(data);
      
      // If we have categories but none selected, select the first one
      if (data.length > 0 && !selectedCategory) {
        handleSelectItem('category', data[0].id);
      }
    } catch (err) {
      console.error("Error fetching service categories:", err);
      setError("Failed to load service categories. Please try again.");
      toast.error("Failed to load service categories");
    } finally {
      setLoading(false);
    }
  };

  const initializeCategoryColors = (cats: ServiceMainCategory[]) => {
    const newColorMap = { ...categoryColorMap };
    cats.forEach((cat, index) => {
      if (!newColorMap[cat.id]) {
        newColorMap[cat.id] = (index % categoryColors.length).toString();
      }
    });
    setCategoryColorMap(newColorMap);
  };

  const handleSelectItem = (type: 'category' | 'subcategory' | 'job', id: string | null) => {
    if (type === 'category') {
      setSelectedCategoryId(id);
      setSelectedSubcategoryId(null);
      setSelectedJobId(null);
      const category = categories.find(c => c.id === id);
      setSelectedCategory(category);
      setSelectedSubcategory(undefined);
      setSelectedJob(undefined);
    } else if (type === 'subcategory') {
      setSelectedSubcategoryId(id);
      setSelectedJobId(null);
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category) {
        const subcategory = category.subcategories.find(s => s.id === id);
        setSelectedSubcategory(subcategory);
        setSelectedJob(undefined);
      }
    } else if (type === 'job') {
      setSelectedJobId(id);
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category) {
        const subcategory = category.subcategories.find(s => s.id === selectedSubcategoryId);
        if (subcategory) {
          const job = subcategory.jobs.find(j => j.id === id);
          setSelectedJob(job);
        }
      }
    }
  };

  const handleSaveService = async (
    category: ServiceMainCategory | null,
    subcategory: any | null,
    job: any | null
  ) => {
    try {
      if (category) {
        // Save category changes
        const updatedCategory = { ...category };
        await saveServiceCategory(updatedCategory);
        setCategories(prev => 
          prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
        );
        setSelectedCategory(updatedCategory);
        toast.success("Category updated successfully");
      } else if (subcategory) {
        // Save subcategory changes
        const parentCategory = { ...selectedCategory! };
        const updatedSubcategories = parentCategory.subcategories.map(sub => 
          sub.id === subcategory.id ? subcategory : sub
        );
        parentCategory.subcategories = updatedSubcategories;
        await saveServiceCategory(parentCategory);
        setCategories(prev => 
          prev.map(c => c.id === parentCategory.id ? parentCategory : c)
        );
        setSelectedCategory(parentCategory);
        setSelectedSubcategory(subcategory);
        toast.success("Subcategory updated successfully");
      } else if (job) {
        // Save job changes
        const parentCategory = { ...selectedCategory! };
        const parentSubcategory = parentCategory.subcategories.find(
          sub => sub.id === selectedSubcategoryId
        );
        
        if (parentSubcategory) {
          const updatedJobs = parentSubcategory.jobs.map(j => 
            j.id === job.id ? job : j
          );
          
          const updatedSubcategory = { 
            ...parentSubcategory, 
            jobs: updatedJobs 
          };
          
          const updatedSubcategories = parentCategory.subcategories.map(sub => 
            sub.id === updatedSubcategory.id ? updatedSubcategory : sub
          );
          
          parentCategory.subcategories = updatedSubcategories;
          await saveServiceCategory(parentCategory);
          setCategories(prev => 
            prev.map(c => c.id === parentCategory.id ? parentCategory : c)
          );
          setSelectedCategory(parentCategory);
          setSelectedSubcategory(updatedSubcategory);
          setSelectedJob(job);
          toast.success("Service updated successfully");
        }
      }
    } catch (err) {
      console.error("Error saving changes:", err);
      toast.error("Failed to save changes");
    }
  };

  const handleColorChange = (index: number) => {
    if (selectedCategory) {
      const newColorMap = { ...categoryColorMap };
      newColorMap[selectedCategory.id] = index.toString();
      setCategoryColorMap(newColorMap);
    }
  };

  const handleBulkImportComplete = (importedCategories: ServiceMainCategory[]) => {
    setIsBulkImportOpen(false);
    if (importedCategories && importedCategories.length > 0) {
      // Refresh the categories list after import
      fetchCategories();
      toast.success(`Successfully imported ${importedCategories.length} service categories`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Service Hierarchy</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Service Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceHierarchyBrowser
                categories={categories}
                loading={loading}
                error={error}
                selectedCategoryId={selectedCategoryId}
                selectedSubcategoryId={selectedSubcategoryId}
                selectedJobId={selectedJobId}
                onSelectItem={handleSelectItem}
                categoryColorMap={categoryColorMap}
                categoryColors={categoryColors}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Service Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceEditor
                category={selectedCategory}
                subcategory={selectedSubcategory}
                job={selectedJob}
                onSave={handleSaveService}
                categoryColors={categoryColors}
                colorIndex={selectedCategory ? parseInt(categoryColorMap[selectedCategory.id] || "0") : 0}
                onColorChange={handleColorChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <ServicesPriceReport categories={categories} />
        </TabsContent>
      </Tabs>

      {/* Bulk Import Dialog */}
      <AlertDialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <AlertDialogContent className="sm:max-w-[600px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Import Services</AlertDialogTitle>
          </AlertDialogHeader>
          <ServiceBulkImport
            onCancel={() => setIsBulkImportOpen(false)}
            onComplete={handleBulkImportComplete}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceHierarchyManager;
