
import React, { useState } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Spinner } from 'lucide-react';
import { RenameItemDialog } from './RenameItemDialog';
import { updateCategoryName, updateSubcategoryName, updateJobName } from '@/lib/services/serviceApi';
import { toast } from 'sonner';

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedJobId: string | null;
  onSelectItem: (type: 'category' | 'subcategory' | 'job', id: string | null) => void;
  categoryColorMap: Record<string, string>;
  categoryColors: string[];
}

type EditItem = {
  type: 'category' | 'subcategory' | 'job';
  id: string;
  name: string;
  categoryId?: string;
  subcategoryId?: string;
} | null;

export const ServiceHierarchyBrowser: React.FC<ServiceHierarchyBrowserProps> = ({
  categories,
  loading,
  error,
  selectedCategoryId,
  selectedSubcategoryId,
  selectedJobId,
  onSelectItem,
  categoryColorMap,
  categoryColors,
}) => {
  const [editItem, setEditItem] = useState<EditItem>(null);
  const [renamingLoading, setRenamingLoading] = useState(false);

  const handleSelectCategory = (categoryId: string) => {
    if (categoryId === selectedCategoryId) {
      onSelectItem('category', null);
    } else {
      onSelectItem('category', categoryId);
    }
  };

  const handleSelectSubcategory = (subcategoryId: string) => {
    if (subcategoryId === selectedSubcategoryId) {
      onSelectItem('subcategory', null);
    } else {
      onSelectItem('subcategory', subcategoryId);
    }
  };

  const handleSelectJob = (jobId: string) => {
    if (jobId === selectedJobId) {
      onSelectItem('job', null);
    } else {
      onSelectItem('job', jobId);
    }
  };

  const handleDoubleClickItem = (item: EditItem) => {
    setEditItem(item);
  };

  const handleSaveItemName = async (newName: string) => {
    if (!editItem) return;
    
    setRenamingLoading(true);
    try {
      if (editItem.type === 'category') {
        await updateCategoryName(editItem.id, newName);
      } else if (editItem.type === 'subcategory' && editItem.categoryId) {
        await updateSubcategoryName(editItem.categoryId, editItem.id, newName);
      } else if (editItem.type === 'job' && editItem.categoryId && editItem.subcategoryId) {
        await updateJobName(editItem.categoryId, editItem.subcategoryId, editItem.id, newName);
      }
      
      // Refresh categories after successful update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('refresh-service-categories'));
      }
    } catch (error) {
      console.error('Failed to update item name:', error);
      toast.error('Failed to update name');
      throw error; // Let the dialog component handle the error
    } finally {
      setRenamingLoading(false);
      setEditItem(null);
    }
  };

  const handleCancelEdit = () => {
    setEditItem(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading service hierarchy...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-2">Error loading service hierarchy</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-md text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">No service categories found</h3>
        <p className="text-gray-500">
          Add your first service category to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {categories.map((category) => {
        const isCategorySelected = category.id === selectedCategoryId;
        const categoryColor = categoryColorMap[category.id] || categoryColors[0];
        const borderColorClass = `border-l-4 border-${categoryColor}-500`;
        
        return (
          <div key={category.id} className="border-b border-gray-200 last:border-b-0">
            {/* Category Header */}
            <div 
              className={`flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 ${isCategorySelected ? 'bg-gray-100' : ''} ${borderColorClass}`}
              onClick={() => handleSelectCategory(category.id)}
              onDoubleClick={() => handleDoubleClickItem({
                type: 'category',
                id: category.id,
                name: category.name
              })}
            >
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-gray-500">{category.subcategories.length} subcategories</div>
            </div>
            
            {/* Subcategories */}
            {isCategorySelected && (
              <div className="pl-4">
                {category.subcategories.map((subcategory) => {
                  const isSubcategorySelected = subcategory.id === selectedSubcategoryId;
                  
                  return (
                    <div key={subcategory.id} className="border-t border-gray-100 first:border-t-0">
                      {/* Subcategory Header */}
                      <div 
                        className={`flex justify-between items-center p-2 cursor-pointer hover:bg-gray-50 ${isSubcategorySelected ? 'bg-gray-50' : ''}`}
                        onClick={() => handleSelectSubcategory(subcategory.id)}
                        onDoubleClick={() => handleDoubleClickItem({
                          type: 'subcategory',
                          id: subcategory.id,
                          name: subcategory.name,
                          categoryId: category.id
                        })}
                      >
                        <div>{subcategory.name}</div>
                        <div className="text-xs text-gray-500">{subcategory.jobs.length} services</div>
                      </div>
                      
                      {/* Jobs */}
                      {isSubcategorySelected && (
                        <div className="pl-4 bg-white">
                          {subcategory.jobs.map((job) => (
                            <div 
                              key={job.id}
                              className={`p-2 border-t border-gray-100 cursor-pointer hover:bg-blue-50 ${job.id === selectedJobId ? 'bg-blue-50' : ''}`}
                              onClick={() => handleSelectJob(job.id)}
                              onDoubleClick={() => handleDoubleClickItem({
                                type: 'job',
                                id: job.id,
                                name: job.name,
                                categoryId: category.id,
                                subcategoryId: subcategory.id
                              })}
                            >
                              <div className="flex justify-between items-center">
                                <span>{job.name}</span>
                                {job.price && <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">${job.price}</span>}
                              </div>
                              {job.estimatedTime && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Est. time: {job.estimatedTime} min
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Edit Dialog */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <RenameItemDialog
              currentName={editItem.name}
              itemType={editItem.type}
              onSave={handleSaveItemName}
              onCancel={handleCancelEdit}
              isLoading={renamingLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};
