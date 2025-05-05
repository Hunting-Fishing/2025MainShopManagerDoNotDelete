
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader } from 'lucide-react';
import { updateCategoryName, updateSubcategoryName, updateJobName } from '@/lib/services/serviceApi';
import { toast } from 'sonner';

interface CategoryColorStyle {
  bg: string;
  text: string;
  border: string;
}

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedJobId: string | null;
  onSelectItem: (type: 'category' | 'subcategory' | 'job', id: string | null) => void;
  categoryColorMap?: Record<string, string>;
  categoryColors?: CategoryColorStyle[];
  onCategoriesUpdated?: () => void;
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
  categoryColors = [],
  onCategoriesUpdated
}) => {
  // State for inline editing
  const [editingItem, setEditingItem] = useState<{
    type: 'category' | 'subcategory' | 'job';
    id: string;
    name: string;
    parentId?: string;  // For subcategory or job
    grandparentId?: string; // Only for job
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle double-click to start editing
  const handleDoubleClick = (
    type: 'category' | 'subcategory' | 'job', 
    id: string, 
    name: string, 
    parentId?: string, 
    grandparentId?: string
  ) => {
    setEditingItem({ type, id, name, parentId, grandparentId });
  };

  // Handle edit name changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, name: e.target.value });
    }
  };

  // Handle edit name submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      switch (editingItem.type) {
        case 'category':
          await updateCategoryName(editingItem.id, editingItem.name);
          break;
        case 'subcategory':
          if (editingItem.parentId) {
            await updateSubcategoryName(editingItem.parentId, editingItem.id, editingItem.name);
          }
          break;
        case 'job':
          if (editingItem.parentId && editingItem.grandparentId) {
            await updateJobName(editingItem.grandparentId, editingItem.parentId, editingItem.id, editingItem.name);
          }
          break;
      }
      
      toast.success(`${editingItem.type === 'job' ? 'Service' : editingItem.type} name updated successfully`);
      
      // Refresh the categories after updating
      if (onCategoriesUpdated) {
        onCategoriesUpdated();
      }
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error(`Failed to update ${editingItem.type} name`);
    } finally {
      setIsSubmitting(false);
      setEditingItem(null);
    }
  };

  // Handle edit cancellation by Escape key or clicking outside
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingItem(null);
    }
  };

  const handleBlur = () => {
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="flex items-center gap-2">
          <Loader className="h-5 w-5 animate-spin text-gray-500" />
          <span className="text-gray-500">Loading services...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
        <p className="mb-2">No services configured yet.</p>
        <p className="text-sm">Use the buttons above to create your service catalog.</p>
      </div>
    );
  }

  // Helper function to get color styles for a category
  const getCategoryColorStyle = (categoryId: string): CategoryColorStyle => {
    if (!categoryColorMap || !categoryColors || categoryColors.length === 0) {
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300'
      };
    }
    
    const colorIndex = parseInt(categoryColorMap[categoryId] || '0');
    return categoryColors[colorIndex % categoryColors.length] || categoryColors[0];
  };

  // Render edit form for inline editing
  const renderEditForm = () => {
    if (!editingItem) return null;
    
    return (
      <form onSubmit={handleEditSubmit} className="inline-block w-full">
        <input
          type="text"
          value={editingItem.name}
          onChange={handleEditChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus
          className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:border-blue-600 text-gray-800"
        />
      </form>
    );
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[500px]">
      {/* Categories Column */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-gray-200 px-4 py-3 font-medium text-sm bg-gray-50">
            Categories
          </div>
          <ScrollArea className="h-[450px] rounded-b-xl">
            <div className="p-2">
              {categories.map(category => {
                const colorStyle = getCategoryColorStyle(category.id);
                const isEditing = editingItem?.type === 'category' && editingItem.id === category.id;
                
                return (
                  <div
                    key={category.id}
                    className={`px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                      selectedCategoryId === category.id
                        ? `${colorStyle.bg} ${colorStyle.text} font-medium border ${colorStyle.border}`
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectItem('category', category.id)}
                    onDoubleClick={() => handleDoubleClick('category', category.id, category.name)}
                  >
                    <div className="flex justify-between items-center">
                      {isEditing ? (
                        renderEditForm()
                      ) : (
                        <>
                          <span>{category.name}</span>
                          <Badge 
                            className={`${colorStyle.bg} ${colorStyle.text} border ${colorStyle.border} text-xs`}
                          >
                            {category.subcategories.length} subcategories
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Subcategories Column */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-gray-200 px-4 py-3 font-medium text-sm bg-gray-50">
            Subcategories
          </div>
          <ScrollArea className="h-[450px] rounded-b-xl">
            <div className="p-2">
              {selectedCategoryId ? (
                categories.find(cat => cat.id === selectedCategoryId)?.subcategories.length ? (
                  categories
                    .find(cat => cat.id === selectedCategoryId)
                    ?.subcategories.map(subcategory => {
                      const colorStyle = getCategoryColorStyle(selectedCategoryId);
                      const isEditing = editingItem?.type === 'subcategory' && editingItem.id === subcategory.id;
                      
                      return (
                        <div
                          key={subcategory.id}
                          className={`px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                            selectedSubcategoryId === subcategory.id
                              ? `${colorStyle.bg} ${colorStyle.text} font-medium border ${colorStyle.border}`
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => onSelectItem('subcategory', subcategory.id)}
                          onDoubleClick={() => handleDoubleClick('subcategory', subcategory.id, subcategory.name, selectedCategoryId)}
                        >
                          <div className="flex justify-between items-center">
                            {isEditing ? (
                              renderEditForm()
                            ) : (
                              <>
                                <span>{subcategory.name}</span>
                                <Badge 
                                  className={`${colorStyle.bg} ${colorStyle.text} border ${colorStyle.border} text-xs`}
                                >
                                  {subcategory.jobs.length} services
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No subcategories yet
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a category first
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Jobs/Services Column */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-gray-200 px-4 py-3 font-medium text-sm bg-gray-50">
            Services
          </div>
          <ScrollArea className="h-[450px] rounded-b-xl">
            <div className="p-2">
              {selectedSubcategoryId ? (
                categories
                  .find(cat => cat.id === selectedCategoryId)
                  ?.subcategories.find(sub => sub.id === selectedSubcategoryId)
                  ?.jobs.length ? (
                  categories
                    .find(cat => cat.id === selectedCategoryId)
                    ?.subcategories.find(sub => sub.id === selectedSubcategoryId)
                    ?.jobs.map(job => {
                      const colorStyle = getCategoryColorStyle(selectedCategoryId || '');
                      const isEditing = editingItem?.type === 'job' && editingItem.id === job.id;
                      
                      return (
                        <div
                          key={job.id}
                          className={`px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                            selectedJobId === job.id
                              ? `${colorStyle.bg} ${colorStyle.text} font-medium border ${colorStyle.border}`
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => onSelectItem('job', job.id)}
                          onDoubleClick={() => handleDoubleClick('job', job.id, job.name, selectedSubcategoryId, selectedCategoryId || '')}
                        >
                          {isEditing ? (
                            renderEditForm()
                          ) : (
                            <>
                              <div className="font-medium">{job.name}</div>
                              <div className="text-xs text-gray-500 flex justify-between mt-1">
                                <span>${job.price?.toFixed(2) || '0.00'}</span>
                                <span>{job.estimatedTime || 0} min</span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No services yet
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a subcategory first
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
