
import React, { useState, useEffect } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ChevronDown, ChevronRight, Edit, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryColorStyle } from './CategoryColorConfig';
import { toast } from 'sonner';
import { updateServiceItemName, deleteServiceItem, addSubcategory, addJob } from '@/lib/services/serviceApi';

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedJobId: string | null;
  onSelectItem: (type: 'category' | 'subcategory' | 'job', id: string | null) => void;
  categoryColorMap: Record<string, string>;
  categoryColors: CategoryColorStyle[];
  onCategoriesUpdated: () => void;
}

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
  onCategoriesUpdated
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  const [editingItemType, setEditingItemType] = useState<'category' | 'subcategory' | 'job' | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState<string>('');
  
  // When a category is selected, auto-expand it
  useEffect(() => {
    if (selectedCategoryId) {
      setExpandedCategories(prev => ({
        ...prev,
        [selectedCategoryId]: true
      }));
    }
  }, [selectedCategoryId]);
  
  // When a subcategory is selected, auto-expand its parent
  useEffect(() => {
    if (selectedSubcategoryId && selectedCategoryId) {
      setExpandedSubcategories(prev => ({
        ...prev,
        [selectedSubcategoryId]: true
      }));
    }
  }, [selectedSubcategoryId, selectedCategoryId]);
  
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const toggleSubcategoryExpansion = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };
  
  const handleCategoryClick = (categoryId: string) => {
    onSelectItem('category', categoryId === selectedCategoryId ? null : categoryId);
    if (categoryId !== selectedCategoryId) {
      onSelectItem('subcategory', null);
      onSelectItem('job', null);
    }
  };
  
  const handleSubcategoryClick = (subcategoryId: string) => {
    onSelectItem('subcategory', subcategoryId === selectedSubcategoryId ? null : subcategoryId);
    if (subcategoryId !== selectedSubcategoryId) {
      onSelectItem('job', null);
    }
  };
  
  const handleJobClick = (jobId: string) => {
    onSelectItem('job', jobId === selectedJobId ? null : jobId);
  };

  const startEditing = (type: 'category' | 'subcategory' | 'job', id: string, name: string) => {
    setEditingItemType(type);
    setEditingItemId(id);
    setEditingItemName(name);
  };

  const saveEdit = async () => {
    if (!editingItemType || !editingItemId) return;
    
    try {
      await updateServiceItemName(editingItemId, editingItemType, editingItemName);
      toast.success(`${editingItemType.charAt(0).toUpperCase() + editingItemType.slice(1)} name updated`);
      onCategoriesUpdated(); // Refresh data
    } catch (error) {
      console.error(`Error updating ${editingItemType}:`, error);
      toast.error(`Failed to update ${editingItemType}`);
    }
    
    // Reset editing state
    setEditingItemType(null);
    setEditingItemId(null);
    setEditingItemName('');
  };

  const cancelEdit = () => {
    setEditingItemType(null);
    setEditingItemId(null);
    setEditingItemName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleDeleteItem = async (type: 'category' | 'subcategory' | 'job', id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      try {
        await deleteServiceItem(id, type);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`);
        
        // Reset selection if the deleted item was selected
        if ((type === 'category' && id === selectedCategoryId) ||
            (type === 'subcategory' && id === selectedSubcategoryId) ||
            (type === 'job' && id === selectedJobId)) {
          onSelectItem(type, null);
        }
        
        onCategoriesUpdated(); // Refresh data
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        toast.error(`Failed to delete ${type}`);
      }
    }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    try {
      const name = window.prompt("Enter name for new subcategory:");
      if (!name) return; // User cancelled
      
      await addSubcategory(categoryId, name);
      toast.success("Subcategory added");
      
      // Expand the parent category
      setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: true
      }));
      
      onCategoriesUpdated(); // Refresh data
    } catch (error) {
      console.error("Error adding subcategory:", error);
      toast.error("Failed to add subcategory");
    }
  };

  const handleAddJob = async (subcategoryId: string) => {
    try {
      const name = window.prompt("Enter name for new service:");
      if (!name) return; // User cancelled
      
      await addJob(subcategoryId, name);
      toast.success("Service added");
      
      // Expand the parent subcategory
      setExpandedSubcategories(prev => ({
        ...prev,
        [subcategoryId]: true
      }));
      
      onCategoriesUpdated(); // Refresh data
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Failed to add service");
    }
  };
  
  if (loading) {
    return (
      <div className="mt-4 space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mt-4 p-4 border border-red-300 bg-red-50 text-red-700 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // Helper function to get color style based on index
  const getCategoryColorStyle = (index: number): CategoryColorStyle => {
    return categoryColors[index % categoryColors.length];
  };
  
  return (
    <div className="mt-4">
      <div className="space-y-2">
        {categories.map((category, categoryIndex) => {
          const isExpanded = expandedCategories[category.id] || false;
          const isSelected = selectedCategoryId === category.id;
          const colorIndex = parseInt(categoryColorMap[category.id] || '0');
          const colorStyle = getCategoryColorStyle(colorIndex);
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className={`flex justify-between items-center p-2.5 cursor-pointer ${
                  isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center flex-grow" onClick={() => toggleCategoryExpansion(category.id)}>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                  )}
                  <div 
                    className={`h-3 w-3 rounded-full mr-2 ${colorStyle.bg} ${colorStyle.border}`}
                  />
                  
                  {editingItemType === 'category' && editingItemId === category.id ? (
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={editingItemName}
                      onChange={(e) => setEditingItemName(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="font-medium flex-grow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(category.id);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditing('category', category.id, category.name);
                      }}
                    >
                      {category.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-gray-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSubcategory(category.id);
                    }}
                    title="Add Subcategory"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-gray-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing('category', category.id, category.name);
                    }}
                    title="Edit Category"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem('category', category.id);
                    }}
                    title="Delete Category"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {isExpanded && (
                <div className="pl-6 bg-white border-t border-gray-100">
                  {category.subcategories.length === 0 ? (
                    <p className="p-2 text-sm text-gray-500 italic">No subcategories</p>
                  ) : (
                    <div className="space-y-1 py-1">
                      {category.subcategories.map((subcategory) => {
                        const isSubExpanded = expandedSubcategories[subcategory.id] || false;
                        const isSubSelected = selectedSubcategoryId === subcategory.id;
                        
                        return (
                          <div key={subcategory.id} className="border-l border-gray-200">
                            <div 
                              className={`flex justify-between items-center p-2 ${
                                isSubSelected ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-center flex-grow" onClick={() => toggleSubcategoryExpansion(subcategory.id)}>
                                {isSubExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                                )}
                                
                                {editingItemType === 'subcategory' && editingItemId === subcategory.id ? (
                                  <input
                                    type="text"
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={editingItemName}
                                    onChange={(e) => setEditingItemName(e.target.value)}
                                    onBlur={saveEdit}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                  />
                                ) : (
                                  <span 
                                    className="text-sm flex-grow"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSubcategoryClick(subcategory.id);
                                    }}
                                    onDoubleClick={(e) => {
                                      e.stopPropagation();
                                      startEditing('subcategory', subcategory.id, subcategory.name);
                                    }}
                                  >
                                    {subcategory.name}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-gray-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddJob(subcategory.id);
                                  }}
                                  title="Add Service"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-gray-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing('subcategory', subcategory.id, subcategory.name);
                                  }}
                                  title="Edit Subcategory"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 text-gray-500 hover:text-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem('subcategory', subcategory.id);
                                  }}
                                  title="Delete Subcategory"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            {isSubExpanded && (
                              <div className="pl-6 pb-1">
                                {subcategory.jobs.length === 0 ? (
                                  <p className="p-2 text-xs text-gray-500 italic">No services</p>
                                ) : (
                                  <ul className="space-y-1 py-1">
                                    {subcategory.jobs.map((job) => {
                                      const isJobSelected = selectedJobId === job.id;
                                      
                                      return (
                                        <li 
                                          key={job.id}
                                          className={`flex justify-between items-center py-1.5 px-2 rounded-sm ${
                                            isJobSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex-grow">
                                            {editingItemType === 'job' && editingItemId === job.id ? (
                                              <input
                                                type="text"
                                                className="border border-gray-300 rounded px-2 py-1 text-xs"
                                                value={editingItemName}
                                                onChange={(e) => setEditingItemName(e.target.value)}
                                                onBlur={saveEdit}
                                                onKeyDown={handleKeyDown}
                                                autoFocus
                                              />
                                            ) : (
                                              <span 
                                                className="text-xs"
                                                onClick={() => handleJobClick(job.id)}
                                                onDoubleClick={() => startEditing('job', job.id, job.name)}
                                              >
                                                {job.name}
                                              </span>
                                            )}
                                          </div>
                                          
                                          <div className="flex items-center space-x-1">
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="h-6 w-6 p-0 text-gray-500"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                startEditing('job', job.id, job.name);
                                              }}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteItem('job', job.id);
                                              }}
                                            >
                                              <Trash className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
