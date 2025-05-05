
import React, { useState } from 'react';
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from '@/types/serviceHierarchy';
import { 
  updateServiceItemName, 
  deleteServiceItem, 
  addSubcategory, 
  addJob 
} from '@/lib/services/serviceApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Plus, 
  MoreHorizontal, 
  AlertCircle 
} from 'lucide-react';
import { CategoryColorStyle } from './CategoryColorConfig';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  const [isRenaming, setIsRenaming] = useState(false);
  const [currentRenameId, setCurrentRenameId] = useState<string | null>(null);
  const [currentRenameType, setCurrentRenameType] = useState<'category' | 'subcategory' | 'job' | null>(null);
  const [newName, setNewName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [itemToDeleteType, setItemToDeleteType] = useState<'category' | 'subcategory' | 'job' | null>(null);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState<string | null>(null);
  const [selectedSubcategoryForAdd, setSelectedSubcategoryForAdd] = useState<string | null>(null);
  
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
  
  const handleRename = async () => {
    if (!currentRenameId || !currentRenameType || !newName.trim()) {
      return;
    }
    
    try {
      await updateServiceItemName(currentRenameId, newName.trim(), currentRenameType);
      
      // Refresh the categories data after renaming
      onCategoriesUpdated();
      
      toast.success(`${currentRenameType} renamed successfully`);
      
      // Close the dialog and reset state
      setIsRenaming(false);
      setCurrentRenameId(null);
      setCurrentRenameType(null);
      setNewName('');
    } catch (error) {
      console.error('Error renaming item:', error);
      toast.error('Failed to rename item');
    }
  };
  
  const handleDelete = async () => {
    if (!itemToDeleteId || !itemToDeleteType) {
      return;
    }
    
    try {
      await deleteServiceItem(itemToDeleteId, itemToDeleteType);
      
      // Refresh the categories data after deleting
      onCategoriesUpdated();
      
      toast.success(`${itemToDeleteType} deleted successfully`);
      
      // Close the dialog and reset state
      setIsDeleting(false);
      setItemToDeleteId(null);
      setItemToDeleteType(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };
  
  const openRenameDialog = (id: string, type: 'category' | 'subcategory' | 'job', currentName: string) => {
    setCurrentRenameId(id);
    setCurrentRenameType(type);
    setNewName(currentName);
    setIsRenaming(true);
  };
  
  const openDeleteDialog = (id: string, type: 'category' | 'subcategory' | 'job') => {
    setItemToDeleteId(id);
    setItemToDeleteType(type);
    setIsDeleting(true);
  };
  
  const openAddSubcategoryDialog = (categoryId: string) => {
    setSelectedCategoryForAdd(categoryId);
    setNewItemName('');
    setIsAddingSubcategory(true);
    // Ensure the category is expanded
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: true
    }));
  };
  
  const openAddJobDialog = (categoryId: string, subcategoryId: string) => {
    setSelectedCategoryForAdd(categoryId);
    setSelectedSubcategoryForAdd(subcategoryId);
    setNewItemName('');
    setIsAddingJob(true);
    // Ensure the category and subcategory are expanded
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: true
    }));
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: true
    }));
  };
  
  const handleAddSubcategory = async () => {
    if (!selectedCategoryForAdd) return;
    
    try {
      await addSubcategory(selectedCategoryForAdd, newItemName.trim() || undefined);
      
      // Refresh the categories data after adding
      onCategoriesUpdated();
      
      toast.success('Subcategory added successfully');
      
      // Close the dialog and reset state
      setIsAddingSubcategory(false);
      setSelectedCategoryForAdd(null);
      setNewItemName('');
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error('Failed to add subcategory');
    }
  };
  
  const handleAddJob = async () => {
    if (!selectedCategoryForAdd || !selectedSubcategoryForAdd) return;
    
    try {
      await addJob(selectedCategoryForAdd, selectedSubcategoryForAdd, newItemName.trim() || undefined);
      
      // Refresh the categories data after adding
      onCategoriesUpdated();
      
      toast.success('Service added successfully');
      
      // Close the dialog and reset state
      setIsAddingJob(false);
      setSelectedCategoryForAdd(null);
      setSelectedSubcategoryForAdd(null);
      setNewItemName('');
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to add service');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }
  
  const getBorderColor = (categoryId: string) => {
    const colorClass = categoryColorMap[categoryId];
    return colorClass || 'border-gray-200';
  };
  
  return (
    <div className="mt-4">
      {categories.length === 0 ? (
        <div className="flex justify-center items-center h-64 border border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-500 text-center">
            <p className="mb-2">No services have been configured</p>
            <Button variant="outline" className="mt-2" onClick={() => {}}>
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className={`border-l-4 ${getBorderColor(category.id)}`}
            >
              <div className="px-4 py-3 border-b flex justify-between items-center">
                <div 
                  className="flex-1 flex items-center cursor-pointer" 
                  onClick={() => toggleCategory(category.id)}
                >
                  {expandedCategories[category.id] ? (
                    <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                  )}
                  <div 
                    className={`font-medium ${selectedCategoryId === category.id ? 'text-blue-600' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem('category', category.id);
                    }}
                  >
                    {category.name}
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAddSubcategoryDialog(category.id)}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Subcategory
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openRenameDialog(category.id, 'category', category.name)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(category.id, 'category')}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {expandedCategories[category.id] && (
                <div className="p-2">
                  {category.subcategories.length === 0 ? (
                    <div className="text-sm text-gray-500 italic p-2">No subcategories yet</div>
                  ) : (
                    <div className="space-y-2">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="border rounded-md overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 flex justify-between items-center">
                            <div 
                              className="flex-1 flex items-center cursor-pointer ml-4" 
                              onClick={() => toggleSubcategory(subcategory.id)}
                            >
                              {expandedSubcategories[subcategory.id] ? (
                                <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                              )}
                              <div 
                                className={`${selectedSubcategoryId === subcategory.id ? 'text-blue-600' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectItem('subcategory', subcategory.id);
                                }}
                              >
                                {subcategory.name}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openAddJobDialog(category.id, subcategory.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Service
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openRenameDialog(subcategory.id, 'subcategory', subcategory.name)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteDialog(subcategory.id, 'subcategory')}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {expandedSubcategories[subcategory.id] && (
                            <div className="p-2">
                              {subcategory.jobs.length === 0 ? (
                                <div className="text-sm text-gray-500 italic p-2 ml-4">No services yet</div>
                              ) : (
                                <div className="space-y-1">
                                  {subcategory.jobs.map((job) => (
                                    <div 
                                      key={job.id} 
                                      className={`mx-2 px-3 py-2 rounded-md border border-transparent hover:border-gray-200 flex justify-between items-center cursor-pointer ${selectedJobId === job.id ? 'bg-blue-50 border-blue-200' : ''}`}
                                      onClick={() => onSelectItem('job', job.id)}
                                    >
                                      <div className="flex-1 ml-6">
                                        <div className="font-medium">{job.name}</div>
                                        {job.estimatedTime && job.price && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            <span>${job.price.toFixed(2)}</span>
                                            <span className="mx-2">•</span>
                                            <span>{job.estimatedTime} min</span>
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openRenameDialog(job.id, 'job', job.name)}>
                                              <Edit className="h-4 w-4 mr-2" />
                                              Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                              onClick={() => openDeleteDialog(job.id, 'job')}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {currentRenameType}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRenaming(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRename}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {itemToDeleteType}</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this {itemToDeleteType}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleting(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Subcategory Dialog */}
      <Dialog open={isAddingSubcategory} onOpenChange={setIsAddingSubcategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter subcategory name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingSubcategory(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSubcategory}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Job Dialog */}
      <Dialog open={isAddingJob} onOpenChange={setIsAddingJob}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter service name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingJob(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddJob}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
