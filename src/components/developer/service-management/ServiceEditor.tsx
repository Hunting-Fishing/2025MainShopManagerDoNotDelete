
import React, { useState, useEffect } from 'react';
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from '@/types/serviceHierarchy';
import { 
  createEmptySubcategory, 
  createEmptyJob,
  deepClone
} from '@/lib/services/serviceUtils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface ServiceEditorProps {
  categories: ServiceMainCategory[];
  selectedCategory: ServiceMainCategory | null;
  selectedSubcategory: ServiceSubcategory | null;
  selectedJob: ServiceJob | null;
  onCategoryUpdate: (category: ServiceMainCategory) => void;
  onCategoriesChange: (categories: ServiceMainCategory[]) => void;
}

export const ServiceEditor: React.FC<ServiceEditorProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  selectedJob,
  onCategoryUpdate,
  onCategoriesChange,
}) => {
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory | null>(null);
  const [editedSubcategory, setEditedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [editedJob, setEditedJob] = useState<ServiceJob | null>(null);

  // Update editor state when selection changes
  useEffect(() => {
    setEditedCategory(selectedCategory ? deepClone(selectedCategory) : null);
    setEditedSubcategory(selectedSubcategory ? deepClone(selectedSubcategory) : null);
    setEditedJob(selectedJob ? deepClone(selectedJob) : null);
  }, [selectedCategory, selectedSubcategory, selectedJob]);

  // Handle save for category
  const handleCategorySave = () => {
    if (!editedCategory) return;

    // Validate
    if (!editedCategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    onCategoryUpdate(editedCategory);
  };

  // Handle save for subcategory
  const handleSubcategorySave = () => {
    if (!editedCategory || !editedSubcategory) return;

    // Validate
    if (!editedSubcategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Subcategory name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // Find and replace the subcategory in the category
    const updatedCategory = {
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(sub => 
        sub.id === editedSubcategory.id ? editedSubcategory : sub
      )
    };

    onCategoryUpdate(updatedCategory);
  };

  // Handle save for job
  const handleJobSave = () => {
    if (!editedCategory || !editedSubcategory || !editedJob) return;

    // Validate
    if (!editedJob.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Job name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // Update the job within the subcategory
    const updatedSubcategory = {
      ...editedSubcategory,
      jobs: editedSubcategory.jobs.map(job =>
        job.id === editedJob.id ? editedJob : job
      )
    };

    // Update the subcategory within the category
    const updatedCategory = {
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(sub =>
        sub.id === updatedSubcategory.id ? updatedSubcategory : sub
      )
    };

    onCategoryUpdate(updatedCategory);
  };

  // Add new subcategory to a category
  const handleAddSubcategory = () => {
    if (!editedCategory) return;
    
    const newSubcategory = createEmptySubcategory();
    const updatedCategory = {
      ...editedCategory,
      subcategories: [...editedCategory.subcategories, newSubcategory]
    };
    
    onCategoryUpdate(updatedCategory);
    setEditedSubcategory(newSubcategory);
    setEditedJob(null);

    toast({
      title: "Subcategory Added",
      description: "New subcategory has been added successfully."
    });
  };

  // Delete subcategory from a category
  const handleDeleteSubcategory = (subcategoryId: string) => {
    if (!editedCategory) return;
    
    const updatedCategory = {
      ...editedCategory,
      subcategories: editedCategory.subcategories.filter(sub => sub.id !== subcategoryId)
    };
    
    onCategoryUpdate(updatedCategory);
    
    // If we're deleting the selected subcategory, reset selection
    if (editedSubcategory && editedSubcategory.id === subcategoryId) {
      setEditedSubcategory(null);
      setEditedJob(null);
    }

    toast({
      title: "Subcategory Deleted",
      description: "Subcategory has been deleted successfully."
    });
  };

  // Add new job to a subcategory
  const handleAddJob = () => {
    if (!editedCategory || !editedSubcategory) return;
    
    const newJob = createEmptyJob();
    
    const updatedSubcategory = {
      ...editedSubcategory,
      jobs: [...editedSubcategory.jobs, newJob]
    };
    
    const updatedCategory = {
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(sub =>
        sub.id === updatedSubcategory.id ? updatedSubcategory : sub
      )
    };
    
    onCategoryUpdate(updatedCategory);
    setEditedJob(newJob);

    toast({
      title: "Service Added",
      description: "New service job has been added successfully."
    });
  };

  // Delete job from a subcategory
  const handleDeleteJob = (jobId: string) => {
    if (!editedCategory || !editedSubcategory) return;
    
    const updatedSubcategory = {
      ...editedSubcategory,
      jobs: editedSubcategory.jobs.filter(job => job.id !== jobId)
    };
    
    const updatedCategory = {
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(sub =>
        sub.id === updatedSubcategory.id ? updatedSubcategory : sub
      )
    };
    
    onCategoryUpdate(updatedCategory);
    
    // If we're deleting the selected job, reset selection
    if (editedJob && editedJob.id === jobId) {
      setEditedJob(null);
    }

    toast({
      title: "Service Deleted",
      description: "Service job has been deleted successfully."
    });
  };

  // If nothing is selected, show an empty state
  if (!editedCategory) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Item Selected</h3>
          <p className="text-gray-500 mb-6">
            Select a category, subcategory, or service from the hierarchy browser to edit its details.
          </p>
          {categories.length === 0 && (
            <Button 
              onClick={() => {
                const newCategory = {
                  id: uuidv4(),
                  name: 'New Category',
                  description: '',
                  position: 0,
                  subcategories: [createEmptySubcategory()]
                };
                onCategoriesChange([...categories, newCategory]);
                setEditedCategory(newCategory);
              }}
            >
              Create First Category
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render editor based on what's selected (category, subcategory or job)
  if (editedJob) {
    // Job editor
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Category: {editedCategory.name} &gt; Subcategory: {editedSubcategory?.name}
            </p>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDeleteJob(editedJob.id)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete Service
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="job-name">Service Name</Label>
            <Input
              id="job-name"
              value={editedJob.name}
              onChange={(e) => setEditedJob({
                ...editedJob,
                name: e.target.value
              })}
              placeholder="Enter service name"
            />
          </div>
          
          <div>
            <Label htmlFor="job-description">Description</Label>
            <Textarea
              id="job-description"
              value={editedJob.description || ''}
              onChange={(e) => setEditedJob({
                ...editedJob,
                description: e.target.value
              })}
              placeholder="Enter service description (optional)"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job-price">Price ($)</Label>
              <Input
                id="job-price"
                type="number"
                min="0"
                step="0.01"
                value={editedJob.price || ''}
                onChange={(e) => setEditedJob({
                  ...editedJob,
                  price: e.target.value ? parseFloat(e.target.value) : 0
                })}
                placeholder="Enter price"
              />
            </div>
            
            <div>
              <Label htmlFor="job-time">Estimated Time (minutes)</Label>
              <Input
                id="job-time"
                type="number"
                min="0"
                step="1"
                value={editedJob.estimatedTime || ''}
                onChange={(e) => setEditedJob({
                  ...editedJob,
                  estimatedTime: e.target.value ? parseInt(e.target.value) : 0
                })}
                placeholder="Enter estimated time"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleJobSave}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Save Service
            </Button>
          </div>
        </div>
      </div>
    );
  } else if (editedSubcategory) {
    // Subcategory editor
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Category: {editedCategory.name}
            </p>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDeleteSubcategory(editedSubcategory.id)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete Subcategory
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="subcategory-name">Subcategory Name</Label>
            <Input
              id="subcategory-name"
              value={editedSubcategory.name}
              onChange={(e) => setEditedSubcategory({
                ...editedSubcategory,
                name: e.target.value
              })}
              placeholder="Enter subcategory name"
            />
          </div>
          
          <div>
            <Label htmlFor="subcategory-description">Description</Label>
            <Textarea
              id="subcategory-description"
              value={editedSubcategory.description || ''}
              onChange={(e) => setEditedSubcategory({
                ...editedSubcategory,
                description: e.target.value
              })}
              placeholder="Enter subcategory description (optional)"
              rows={3}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Services in this Subcategory</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddJob}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Service
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-2">
                <div className="divide-y">
                  {editedSubcategory.jobs.length === 0 ? (
                    <div className="py-3 text-center text-gray-500 text-sm italic">
                      No services in this subcategory yet
                    </div>
                  ) : (
                    editedSubcategory.jobs.map(job => (
                      <div key={job.id} className="py-2 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-medium">{job.name || 'Unnamed Service'}</span>
                          {(job.price !== undefined || job.estimatedTime !== undefined) && (
                            <span className="text-xs text-gray-500">
                              {job.price !== undefined && `$${job.price}`}
                              {job.price !== undefined && job.estimatedTime !== undefined && ' • '}
                              {job.estimatedTime !== undefined && `${job.estimatedTime} min`}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditedJob(job)}
                            className="h-8 px-2 text-blue-600"
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteJob(job.id)}
                            className="h-8 px-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleSubcategorySave}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Save Subcategory
            </Button>
          </div>
        </div>
      </div>
    );
  } else {
    // Category editor
    return (
      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={editedCategory.name}
              onChange={(e) => setEditedCategory({
                ...editedCategory,
                name: e.target.value
              })}
              placeholder="Enter category name"
            />
          </div>
          
          <div>
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              value={editedCategory.description || ''}
              onChange={(e) => setEditedCategory({
                ...editedCategory,
                description: e.target.value
              })}
              placeholder="Enter category description (optional)"
              rows={3}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Subcategories</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddSubcategory}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Subcategory
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-2">
                <div className="divide-y">
                  {editedCategory.subcategories.length === 0 ? (
                    <div className="py-3 text-center text-gray-500 text-sm italic">
                      No subcategories yet
                    </div>
                  ) : (
                    editedCategory.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="py-2 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-medium">{subcategory.name || 'Unnamed Subcategory'}</span>
                          <span className="text-xs text-gray-500">
                            {subcategory.jobs.length} {subcategory.jobs.length === 1 ? 'service' : 'services'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditedSubcategory(subcategory)}
                            className="h-8 px-2 text-blue-600"
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteSubcategory(subcategory.id)}
                            className="h-8 px-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleCategorySave}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Save Category
            </Button>
          </div>
        </div>
      </div>
    );
  }
};
