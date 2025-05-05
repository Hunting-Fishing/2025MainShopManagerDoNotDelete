
import React, { useState } from 'react';
import { ServiceEditor } from './ServiceEditor';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RenameItemDialog } from './RenameItemDialog';
import { 
  updateCategoryName, 
  updateSubcategoryName, 
  updateJobName, 
  saveServiceCategory 
} from '@/lib/services/serviceApi';

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedJobId: string | null;
  onSelectItem: (type: 'category' | 'subcategory' | 'job', id: string | null) => void;
  categoryColorMap?: Record<string, string>;
  categoryColors?: Array<{ bg: string; text: string; border: string }>;
}

export const ServiceHierarchyBrowser: React.FC<ServiceHierarchyBrowserProps> = ({
  categories,
  loading,
  error,
  selectedCategoryId,
  selectedSubcategoryId,
  selectedJobId,
  onSelectItem,
  categoryColorMap = {},
  categoryColors = []
}) => {
  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: 'category' | 'subcategory' | 'job';
    name: string;
    categoryId?: string;
    subcategoryId?: string;
  } | null>(null);

  const [savingCategory, setSavingCategory] = useState<ServiceMainCategory | null>(null);
  const [savingSubcategory, setSavingSubcategory] = useState<ServiceSubcategory | null>(null);
  const [savingJob, setSavingJob] = useState<ServiceJob | null>(null);

  const [updatingName, setUpdatingName] = useState(false);

  // Find the selected category
  const selectedCategory = categories.find(category => category.id === selectedCategoryId);
  // Find the selected subcategory
  const selectedSubcategory = selectedCategory?.subcategories?.find(
    subcategory => subcategory.id === selectedSubcategoryId
  );
  // Find the selected service
  const selectedJob = selectedSubcategory?.jobs?.find(
    job => job.id === selectedJobId
  );

  // Calculate some statistics
  const totalSubcategories = categories.reduce(
    (total, category) => total + category.subcategories.length,
    0
  );
  const totalJobs = categories.reduce(
    (total, category) => 
      total + category.subcategories.reduce(
        (subTotal, subcategory) => subTotal + subcategory.jobs.length,
        0
      ),
    0
  );

  const getCategoryColor = (categoryId: string) => {
    const colorIndex = categoryColorMap[categoryId] ? parseInt(categoryColorMap[categoryId]) : 0;
    return categoryColors[colorIndex] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  };

  const handleSaveItem = async (
    category: ServiceMainCategory | null, 
    subcategory: ServiceSubcategory | null, 
    job: ServiceJob | null
  ) => {
    if (category) {
      setSavingCategory(category);
      try {
        await saveServiceCategory(category);
      } finally {
        setSavingCategory(null);
      }
    } else if (subcategory && selectedCategory) {
      setSavingSubcategory(subcategory);
      try {
        // Find index of subcategory to update
        const subcategoryIndex = selectedCategory.subcategories.findIndex(
          sub => sub.id === subcategory.id
        );
        if (subcategoryIndex !== -1) {
          // Create a copy of the category
          const updatedCategory = { ...selectedCategory };
          // Update the subcategory
          updatedCategory.subcategories[subcategoryIndex] = subcategory;
          // Save the updated category
          await saveServiceCategory(updatedCategory);
        }
      } finally {
        setSavingSubcategory(null);
      }
    } else if (job && selectedCategory && selectedSubcategory) {
      setSavingJob(job);
      try {
        // Find index of subcategory that contains the job
        const subcategoryIndex = selectedCategory.subcategories.findIndex(
          sub => sub.id === selectedSubcategory.id
        );
        if (subcategoryIndex !== -1) {
          // Find index of job to update
          const jobIndex = selectedCategory.subcategories[subcategoryIndex].jobs.findIndex(
            j => j.id === job.id
          );
          if (jobIndex !== -1) {
            // Create a copy of the category
            const updatedCategory = { ...selectedCategory };
            // Update the job
            updatedCategory.subcategories[subcategoryIndex].jobs[jobIndex] = job;
            // Save the updated category
            await saveServiceCategory(updatedCategory);
          }
        }
      } finally {
        setSavingJob(null);
      }
    }
  };

  const handleSaveRenamedItem = async (newName: string) => {
    if (!editingItem) return;

    setUpdatingName(true);
    try {
      switch (editingItem.type) {
        case 'category':
          await updateCategoryName(editingItem.id, newName);
          break;
        case 'subcategory':
          if (editingItem.categoryId) {
            await updateSubcategoryName(editingItem.categoryId, editingItem.id, newName);
          }
          break;
        case 'job':
          if (editingItem.categoryId && editingItem.subcategoryId) {
            await updateJobName(
              editingItem.categoryId,
              editingItem.subcategoryId,
              editingItem.id,
              newName
            );
          }
          break;
      }
    } finally {
      setUpdatingName(false);
      setEditingItem(null);
    }
  };

  const renderRenameDialog = () => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="w-full max-w-md">
          <RenameItemDialog
            currentName={editingItem.name}
            itemType={editingItem.type}
            onSave={handleSaveRenamedItem}
            onCancel={() => setEditingItem(null)}
            isLoading={updatingName}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 shadow rounded-lg border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="md:col-span-2 bg-white p-5 shadow rounded-lg border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h3 className="text-lg font-medium">Error loading service hierarchy</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Categories browser */}
      <div className="bg-white p-5 shadow rounded-lg border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium">Service Hierarchy</h2>
          <div className="text-sm text-gray-500">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
          <ul className="space-y-2 max-h-[200px] overflow-y-auto">
            {categories.map(category => {
              const colorClasses = getCategoryColor(category.id);
              
              return (
                <li 
                  key={category.id}
                  className={cn(
                    "flex justify-between items-center p-2 rounded-md cursor-pointer border",
                    selectedCategoryId === category.id
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50 border-transparent"
                  )}
                  onClick={() => onSelectItem('category', category.id)}
                >
                  <div className="flex items-center">
                    <Badge className={cn("mr-2", colorClasses.bg, colorClasses.text, colorClasses.border)}>
                      {category.subcategories.length}
                    </Badge>
                    <span>{category.name}</span>
                  </div>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem({
                        id: category.id,
                        type: 'category',
                        name: category.name
                      });
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        {selectedCategory && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Subcategories</h3>
            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
              {selectedCategory.subcategories.map(subcategory => (
                <li 
                  key={subcategory.id}
                  className={cn(
                    "flex justify-between items-center p-2 rounded-md cursor-pointer border",
                    selectedSubcategoryId === subcategory.id
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50 border-transparent"
                  )}
                  onClick={() => onSelectItem('subcategory', subcategory.id)}
                >
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {subcategory.jobs.length}
                    </Badge>
                    <span>{subcategory.name}</span>
                  </div>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem({
                        id: subcategory.id,
                        type: 'subcategory',
                        name: subcategory.name,
                        categoryId: selectedCategory.id
                      });
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {selectedSubcategory && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Services</h3>
            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
              {selectedSubcategory.jobs.map(job => (
                <li 
                  key={job.id}
                  className={cn(
                    "flex justify-between items-center p-2 rounded-md cursor-pointer border",
                    selectedJobId === job.id
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50 border-transparent"
                  )}
                  onClick={() => onSelectItem('job', job.id)}
                >
                  <span>{job.name}</span>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem({
                        id: job.id,
                        type: 'job',
                        name: job.name,
                        categoryId: selectedCategory.id,
                        subcategoryId: selectedSubcategory.id
                      });
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Service editor */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Item Details</h2>
          </CardHeader>
          <CardContent>
            <ServiceEditor
              category={selectedCategory}
              subcategory={selectedSubcategory}
              job={selectedJob}
              onSave={handleSaveItem}
              categoryColors={categoryColors}
              colorIndex={selectedCategory ? parseInt(categoryColorMap[selectedCategory.id] || "0") : 0}
            />
          </CardContent>
        </Card>
      </div>

      {/* Rename dialog */}
      {renderRenameDialog()}
    </div>
  );
};
