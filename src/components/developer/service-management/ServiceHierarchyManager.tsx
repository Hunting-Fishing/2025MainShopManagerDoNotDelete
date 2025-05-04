import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Upload, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceEditor } from './ServiceEditor';
import ServiceBulkImport from './ServiceBulkImport';
import ServicesPriceReport from './ServicesPriceReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface CategoryColor {
  bg: string;
  text: string;
  border: string;
}

const defaultCategoryColors: CategoryColor[] = [
  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
];

export const ServiceHierarchyManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [categoryColorMap, setCategoryColorMap] = useState<Record<string, string>>({});
  const [categoryColors, setCategoryColors] = useState<CategoryColor[]>(defaultCategoryColors);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Load categories from local storage on component mount
  useEffect(() => {
    const storedCategories = localStorage.getItem('serviceCategories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
      
      const storedColorMap = localStorage.getItem('categoryColorMap');
      if (storedColorMap) {
        setCategoryColorMap(JSON.parse(storedColorMap));
      }
    }
  }, []);

  // Save categories to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('serviceCategories', JSON.stringify(categories));
    localStorage.setItem('categoryColorMap', JSON.stringify(categoryColorMap));
  }, [categories, categoryColorMap]);

  const handleSelectItem = (type: 'category' | 'subcategory' | 'job', id: string | null) => {
    switch (type) {
      case 'category':
        setSelectedCategoryId(id);
        setSelectedSubcategoryId(null);
        setSelectedJobId(null);
        break;
      case 'subcategory':
        setSelectedSubcategoryId(id);
        setSelectedJobId(null);
        break;
      case 'job':
        setSelectedJobId(id);
        break;
    }
    setIsEditorOpen(true); // Open editor on item selection
  };

  const handleOpenEditor = () => {
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSelectedJobId(null);
  };

  const handleOpenBulkImport = () => {
    setIsBulkImportOpen(true);
  };

  const handleCloseBulkImport = () => {
    setIsBulkImportOpen(false);
  };

  const handleCreateCategory = () => {
    const newCategory: ServiceMainCategory = {
      id: uuidv4(),
      name: 'New Category',
      description: '',
      subcategories: [],
    };
    setCategories([...categories, newCategory]);
    setSelectedCategoryId(newCategory.id);
    setIsEditorOpen(true);
  };

  const handleCreateSubcategory = () => {
    if (!selectedCategoryId) return;

    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: 'New Subcategory',
      description: '',
      jobs: [],
    };

    const updatedCategories = categories.map(cat =>
      cat.id === selectedCategoryId
        ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
        : cat
    );

    setCategories(updatedCategories);
    setSelectedSubcategoryId(newSubcategory.id);
    setIsEditorOpen(true);
  };

  const handleCreateJob = () => {
    if (!selectedCategoryId || !selectedSubcategoryId) return;

    const newJob: ServiceJob = {
      id: uuidv4(),
      name: 'New Service',
      description: '',
      estimatedTime: 60,
      price: 50.00,
    };

    const updatedCategories = categories.map(cat =>
      cat.id === selectedCategoryId
        ? {
            ...cat,
            subcategories: cat.subcategories.map(sub =>
              sub.id === selectedSubcategoryId ? { ...sub, jobs: [...sub.jobs, newJob] } : sub
            ),
          }
        : cat
    );

    setCategories(updatedCategories);
    setSelectedJobId(newJob.id);
    setIsEditorOpen(true);
  };

  const handleSave = (
    updatedCategory: ServiceMainCategory | null,
    updatedSubcategory: ServiceSubcategory | null,
    updatedJob: ServiceJob | null
  ) => {
    let updatedCategories = [...categories];

    if (updatedCategory) {
      updatedCategories = updatedCategories.map(cat =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      );
    } else if (updatedSubcategory && selectedCategoryId) {
      updatedCategories = updatedCategories.map(cat =>
        cat.id === selectedCategoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.map(sub =>
                sub.id === updatedSubcategory.id ? updatedSubcategory : sub
              ),
            }
          : cat
      );
    } else if (updatedJob && selectedCategoryId && selectedSubcategoryId) {
      updatedCategories = updatedCategories.map(cat =>
        cat.id === selectedCategoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.map(sub =>
                sub.id === selectedSubcategoryId
                  ? {
                      ...sub,
                      jobs: sub.jobs.map(job => (job.id === updatedJob.id ? updatedJob : job)),
                    }
                  : sub
              ),
            }
          : cat
      );
    }

    setCategories(updatedCategories);
    handleCloseEditor();
    toast.success('Service saved successfully!');
  };

  const handleDelete = (type: 'category' | 'subcategory' | 'job') => {
    if (!selectedCategoryId) return;

    let updatedCategories = [...categories];

    if (type === 'category') {
      updatedCategories = updatedCategories.filter(cat => cat.id !== selectedCategoryId);
      setSelectedCategoryId(null);
    } else if (type === 'subcategory' && selectedSubcategoryId) {
      updatedCategories = updatedCategories.map(cat =>
        cat.id === selectedCategoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.filter(sub => sub.id !== selectedSubcategoryId),
            }
          : cat
      );
      setSelectedSubcategoryId(null);
    } else if (type === 'job' && selectedSubcategoryId && selectedJobId) {
      updatedCategories = updatedCategories.map(cat =>
        cat.id === selectedCategoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.map(sub =>
                sub.id === selectedSubcategoryId
                  ? { ...sub, jobs: sub.jobs.filter(job => job.id !== selectedJobId) }
                  : sub
              ),
            }
          : cat
      );
      setSelectedJobId(null);
    }

    setCategories(updatedCategories);
    handleCloseEditor();
    toast.success('Service deleted successfully!');
  };

  const handleBulkImportComplete = (importedCategories: ServiceMainCategory[]) => {
      setCategories(importedCategories);
      handleCloseBulkImport();
      toast.success('Services imported successfully!');
  };
  
  const handleColorChange = (index: number) => {
    if (!selectedCategoryId) return;
    
    setSelectedColorIndex(index);
    setCategoryColorMap(prevMap => ({
      ...prevMap,
      [selectedCategoryId]: index.toString()
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Panel: Buttons and Hierarchy Browser */}
      <div className="col-span-1">
        <div className="flex flex-col gap-4 mb-6">
          <Button onClick={handleCreateCategory} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={handleCreateSubcategory} disabled={!selectedCategoryId} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Subcategory
          </Button>
          <Button onClick={handleCreateJob} disabled={!selectedSubcategoryId} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
          <Button onClick={handleOpenBulkImport} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <AlertDialog>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the selected service and all of its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => {}}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                  if (selectedJobId) {
                    handleDelete('job');
                  } else if (selectedSubcategoryId) {
                    handleDelete('subcategory');
                  } else if (selectedCategoryId) {
                    handleDelete('category');
                  }
                }}
                >
                  Delete
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>

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
      </div>

      {/* Right Panel: Editor and Analytics */}
      <div className="col-span-2">
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="editor">
            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Service Editor</DialogTitle>
                  <DialogDescription>
                    Make changes to your service details here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <ServiceEditor
                    category={categories.find(cat => cat.id === selectedCategoryId)}
                    subcategory={
                      selectedCategoryId && selectedSubcategoryId
                        ? categories
                            .find(cat => cat.id === selectedCategoryId)
                            ?.subcategories.find(sub => sub.id === selectedSubcategoryId)
                        : undefined
                    }
                    job={
                      selectedCategoryId && selectedSubcategoryId && selectedJobId
                        ? categories
                            .find(cat => cat.id === selectedCategoryId)
                            ?.subcategories.find(sub => sub.id === selectedSubcategoryId)
                            ?.jobs.find(job => job.id === selectedJobId)
                        : undefined
                    }
                    onSave={handleSave}
                    categoryColors={categoryColors}
                    colorIndex={parseInt(categoryColorMap[selectedCategoryId || '0'] || '0')}
                    onColorChange={handleColorChange}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Service Price Report</CardTitle>
              </CardHeader>
              <CardContent>
                <ServicesPriceReport categories={categories} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bulk Import Modal */}
      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Import Services</DialogTitle>
            <DialogDescription>
              Import multiple services from an Excel file.
            </DialogDescription>
          </DialogHeader>
          <ServiceBulkImport onCancel={handleCloseBulkImport} onComplete={handleBulkImportComplete} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
