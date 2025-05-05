
import React, { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { cn } from '@/lib/utils';
import { Edit, Trash2, ChevronDown, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateCategoryName, updateSubcategoryName, updateJobName, addSubcategoryToCategory, addServiceToSubcategory } from '@/lib/services/serviceApi';
import { createEmptySubcategory, createEmptyJob } from '@/lib/services/serviceUtils';

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
  
  // State for adding subcategory
  const [isAddingSubcategory, setIsAddingSubcategory] = useState<boolean>(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState<string>('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');

  // State for adding service
  const [isAddingService, setIsAddingService] = useState<boolean>(false);
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [parentSubcategoryId, setParentSubcategoryId] = useState<string>('');

  // State for editing items
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemType, setEditingItemType] = useState<'category' | 'subcategory' | 'job' | null>(null);
  const [editingItemValue, setEditingItemValue] = useState<string>('');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  const handleStartEdit = (type: 'category' | 'subcategory' | 'job', id: string, initialValue: string) => {
    setIsEditing(true);
    setEditingItemId(id);
    setEditingItemType(type);
    setEditingItemValue(initialValue);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItemId(null);
    setEditingItemType(null);
    setEditingItemValue('');
  };

  const handleSaveEdit = async () => {
    if (!editingItemId || !editingItemType || !editingItemValue.trim()) {
      return;
    }

    try {
      if (editingItemType === 'category') {
        await updateCategoryName(editingItemId, editingItemValue);
      } else if (editingItemType === 'subcategory' && selectedCategoryId) {
        await updateSubcategoryName(selectedCategoryId, editingItemId, editingItemValue);
      } else if (editingItemType === 'job' && selectedCategoryId && selectedSubcategoryId) {
        await updateJobName(selectedCategoryId, selectedSubcategoryId, editingItemId, editingItemValue);
      }

      toast.success(`${editingItemType.charAt(0).toUpperCase() + editingItemType.slice(1)} updated successfully`);
      onCategoriesUpdated();
    } catch (error) {
      toast.error(`Failed to update ${editingItemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      handleCancelEdit();
    }
  };

  const handleAddSubcategory = (categoryId: string) => {
    setParentCategoryId(categoryId);
    setNewSubcategoryName('');
    setIsAddingSubcategory(true);
  };

  const handleSaveNewSubcategory = async () => {
    if (!newSubcategoryName.trim() || !parentCategoryId) {
      toast.error('Subcategory name is required');
      return;
    }

    try {
      const newSubcategory = createEmptySubcategory(newSubcategoryName);
      await addSubcategoryToCategory(parentCategoryId, newSubcategory);
      
      toast.success('Subcategory added successfully');
      onCategoriesUpdated();
      
      // Auto-expand the parent category to show the new subcategory
      setExpandedCategories(prev => ({
        ...prev,
        [parentCategoryId]: true
      }));
      
      setIsAddingSubcategory(false);
    } catch (error) {
      toast.error(`Failed to add subcategory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddService = (categoryId: string, subcategoryId: string) => {
    setParentCategoryId(categoryId);
    setParentSubcategoryId(subcategoryId);
    setNewServiceName('');
    setIsAddingService(true);
  };

  const handleSaveNewService = async () => {
    if (!newServiceName.trim() || !parentCategoryId || !parentSubcategoryId) {
      toast.error('Service name is required');
      return;
    }

    try {
      const newService = createEmptyJob(newServiceName);
      await addServiceToSubcategory(parentCategoryId, parentSubcategoryId, newService);
      
      toast.success('Service added successfully');
      onCategoriesUpdated();
      
      // Auto-expand the parent category and subcategory to show the new service
      setExpandedCategories(prev => ({
        ...prev,
        [parentCategoryId]: true
      }));
      
      setExpandedSubcategories(prev => ({
        ...prev,
        [parentSubcategoryId]: true
      }));
      
      setIsAddingService(false);
    } catch (error) {
      toast.error(`Failed to add service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Error loading service hierarchy: {error}</p>
        <Button variant="outline" className="mt-4" onClick={onCategoriesUpdated}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="overflow-y-auto max-h-[600px]">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map(category => (
                <React.Fragment key={category.id}>
                  <tr 
                    className={cn(
                      "hover:bg-gray-50 cursor-pointer", 
                      selectedCategoryId === category.id && "bg-blue-50"
                    )}
                    onClick={() => onSelectItem('category', category.id)}
                  >
                    <td className="px-6 py-4 flex items-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category.id);
                        }}
                        className="mr-2 focus:outline-none"
                      >
                        {expandedCategories[category.id] ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      
                      <span 
                        className={cn(
                          "inline-block w-3 h-3 rounded-full mr-2",
                          categoryColorMap[category.id] 
                            ? `bg-${categoryColorMap[category.id]}-500` 
                            : "bg-gray-400"
                        )}
                      ></span>
                      
                      <span 
                        className="font-medium" 
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit('category', category.id, category.name);
                        }}
                      >
                        {category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit('category', category.id, category.name);
                          }}
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSubcategory(category.id);
                          }}
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span className="sr-only">Add Subcategory</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Subcategories */}
                  {expandedCategories[category.id] && category.subcategories.map(subcategory => (
                    <React.Fragment key={subcategory.id}>
                      <tr 
                        className={cn(
                          "hover:bg-gray-50 cursor-pointer", 
                          selectedSubcategoryId === subcategory.id && "bg-blue-50"
                        )}
                        onClick={() => onSelectItem('subcategory', subcategory.id)}
                      >
                        <td className="px-6 py-4 flex items-center pl-10">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubcategory(subcategory.id);
                            }}
                            className="mr-2 focus:outline-none"
                          >
                            {expandedSubcategories[subcategory.id] ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                          
                          <span 
                            className="font-medium"
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit('subcategory', subcategory.id, subcategory.name);
                            }}
                          >
                            {subcategory.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit('subcategory', subcategory.id, subcategory.name);
                              }}
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddService(category.id, subcategory.id);
                              }}
                            >
                              <PlusCircle className="h-4 w-4" />
                              <span className="sr-only">Add Service</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Jobs/Services */}
                      {expandedSubcategories[subcategory.id] && subcategory.jobs.map(job => (
                        <tr 
                          key={job.id}
                          className={cn(
                            "hover:bg-gray-50 cursor-pointer", 
                            selectedJobId === job.id && "bg-blue-50"
                          )}
                          onClick={() => onSelectItem('job', job.id)}
                        >
                          <td className="px-6 py-4 flex items-center pl-16">
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit('job', job.id, job.name);
                              }}
                            >
                              {job.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit('job', job.id, job.name);
                              }}
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editingItemType}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="item-name" className="text-right mb-2 block">
              Name
            </Label>
            <Input
              id="item-name"
              value={editingItemValue}
              onChange={(e) => setEditingItemValue(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Subcategory Dialog */}
      <Dialog open={isAddingSubcategory} onOpenChange={setIsAddingSubcategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="subcategory-name" className="text-right mb-2 block">
              Subcategory Name
            </Label>
            <Input
              id="subcategory-name"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              className="w-full"
              autoFocus
              placeholder="Enter subcategory name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingSubcategory(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewSubcategory}>Add Subcategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Service Dialog */}
      <Dialog open={isAddingService} onOpenChange={setIsAddingService}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="service-name" className="text-right mb-2 block">
              Service Name
            </Label>
            <Input
              id="service-name"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="w-full"
              autoFocus
              placeholder="Enter service name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingService(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewService}>Add Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
