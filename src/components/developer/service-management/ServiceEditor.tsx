
import React, { useState, useEffect } from 'react';
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from '@/types/serviceHierarchy';
import { 
  createEmptySubcategory,
  createEmptyJob
} from '@/lib/services/serviceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  onCategoriesChange
}) => {
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory | null>(null);
  const [editedSubcategory, setEditedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [editedJob, setEditedJob] = useState<ServiceJob | null>(null);

  // Update local state when selected items change
  useEffect(() => {
    if (selectedCategory) {
      setEditedCategory({ ...selectedCategory });
    } else {
      setEditedCategory(null);
    }

    if (selectedSubcategory) {
      setEditedSubcategory({ ...selectedSubcategory });
    } else {
      setEditedSubcategory(null);
    }

    if (selectedJob) {
      setEditedJob({ ...selectedJob });
    } else {
      setEditedJob(null);
    }
  }, [selectedCategory, selectedSubcategory, selectedJob]);

  // Handle saving category changes
  const handleSaveCategory = () => {
    if (!editedCategory) return;
    onCategoryUpdate(editedCategory);
  };

  // Handle saving subcategory changes
  const handleSaveSubcategory = () => {
    if (!editedCategory || !editedSubcategory) return;

    const updatedCategory = { ...editedCategory };
    const subIndex = updatedCategory.subcategories.findIndex(
      sub => sub.id === editedSubcategory.id
    );

    if (subIndex !== -1) {
      updatedCategory.subcategories[subIndex] = editedSubcategory;
      onCategoryUpdate(updatedCategory);
      toast({
        title: "Subcategory Updated",
        description: "Subcategory has been updated successfully."
      });
    }
  };

  // Handle saving job changes
  const handleSaveJob = () => {
    if (!editedCategory || !editedSubcategory || !editedJob) return;

    const updatedCategory = { ...editedCategory };
    const subIndex = updatedCategory.subcategories.findIndex(
      sub => sub.id === editedSubcategory.id
    );

    if (subIndex !== -1) {
      const jobIndex = updatedCategory.subcategories[subIndex].jobs.findIndex(
        job => job.id === editedJob.id
      );

      if (jobIndex !== -1) {
        updatedCategory.subcategories[subIndex].jobs[jobIndex] = editedJob;
        onCategoryUpdate(updatedCategory);
        toast({
          title: "Service Updated",
          description: "Service has been updated successfully."
        });
      }
    }
  };

  // Handle deleting subcategory
  const handleDeleteSubcategory = () => {
    if (!editedCategory || !editedSubcategory) return;

    const updatedCategory = { ...editedCategory };
    updatedCategory.subcategories = updatedCategory.subcategories.filter(
      sub => sub.id !== editedSubcategory.id
    );

    onCategoryUpdate(updatedCategory);
    setEditedSubcategory(null);

    toast({
      title: "Subcategory Deleted",
      description: "Subcategory has been deleted successfully."
    });
  };

  // Handle deleting job
  const handleDeleteJob = () => {
    if (!editedCategory || !editedSubcategory || !editedJob) return;

    const updatedCategory = { ...editedCategory };
    const subIndex = updatedCategory.subcategories.findIndex(
      sub => sub.id === editedSubcategory.id
    );

    if (subIndex !== -1) {
      updatedCategory.subcategories[subIndex].jobs = updatedCategory.subcategories[subIndex].jobs.filter(
        job => job.id !== editedJob.id
      );

      onCategoryUpdate(updatedCategory);
      setEditedJob(null);

      toast({
        title: "Service Deleted",
        description: "Service has been deleted successfully."
      });
    }
  };

  // Add new subcategory to selected category
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

  // Add new job to selected subcategory
  const handleAddJob = () => {
    if (!editedCategory || !editedSubcategory) return;

    const newJob = createEmptyJob();
    
    const updatedCategory = { ...editedCategory };
    const subIndex = updatedCategory.subcategories.findIndex(
      sub => sub.id === editedSubcategory.id
    );

    if (subIndex !== -1) {
      updatedCategory.subcategories[subIndex].jobs.push(newJob);
      onCategoryUpdate(updatedCategory);
      
      // Update the edited subcategory and job
      setEditedSubcategory(updatedCategory.subcategories[subIndex]);
      setEditedJob(newJob);

      toast({
        title: "Service Added",
        description: "New service has been added successfully."
      });
    }
  };

  // If nothing is selected, show instructions
  if (!selectedCategory && !selectedSubcategory && !selectedJob) {
    return (
      <div className="p-4 text-center border border-dashed border-gray-300 rounded-md bg-gray-50">
        <p className="text-gray-500 mb-2">Select an item from the hierarchy to edit</p>
        <p className="text-sm text-gray-400">Or create a new category to get started</p>
      </div>
    );
  }

  // Render editor for selected category
  if (editedCategory && !editedSubcategory && !editedJob) {
    return (
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input 
              id="categoryName"
              value={editedCategory.name} 
              onChange={(e) => setEditedCategory({ ...editedCategory, name: e.target.value })} 
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoryDescription">Description</Label>
            <Textarea 
              id="categoryDescription"
              value={editedCategory.description || ''} 
              onChange={(e) => setEditedCategory({ ...editedCategory, description: e.target.value })} 
              className="w-full min-h-[100px]"
            />
          </div>
          
          <div className="pt-4 flex justify-between">
            <Button 
              onClick={handleSaveCategory}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Category
            </Button>
            
            <Button 
              onClick={handleAddSubcategory}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Subcategory
            </Button>
          </div>
          
          <div className="pt-4">
            <h3 className="font-medium mb-2">Subcategories</h3>
            {editedCategory.subcategories.length > 0 ? (
              <div className="space-y-2">
                {editedCategory.subcategories.map(sub => (
                  <Card key={sub.id} className="hover:bg-gray-50 cursor-pointer">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{sub.name}</div>
                        <div className="text-sm text-gray-500">
                          {sub.jobs.length} {sub.jobs.length === 1 ? 'service' : 'services'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
                No subcategories yet. Add one above.
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Render editor for selected subcategory
  if (editedCategory && editedSubcategory && !editedJob) {
    return (
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-2">
            Category: {editedCategory.name}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subcategoryName">Subcategory Name</Label>
            <Input 
              id="subcategoryName"
              value={editedSubcategory.name} 
              onChange={(e) => setEditedSubcategory({ ...editedSubcategory, name: e.target.value })} 
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subcategoryDescription">Description</Label>
            <Textarea 
              id="subcategoryDescription"
              value={editedSubcategory.description || ''} 
              onChange={(e) => setEditedSubcategory({ ...editedSubcategory, description: e.target.value })} 
              className="w-full min-h-[100px]"
            />
          </div>
          
          <div className="pt-4 flex justify-between">
            <div className="space-x-2">
              <Button 
                onClick={handleSaveSubcategory}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              
              <Button 
                onClick={handleDeleteSubcategory}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
            
            <Button 
              onClick={handleAddJob}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
          
          <div className="pt-4">
            <h3 className="font-medium mb-2">Services</h3>
            {editedSubcategory.jobs.length > 0 ? (
              <div className="space-y-2">
                {editedSubcategory.jobs.map(job => (
                  <Card key={job.id} className="hover:bg-gray-50 cursor-pointer">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{job.name}</div>
                        <div className="flex space-x-3 text-sm text-gray-500">
                          {job.estimatedTime && (
                            <span>Time: {Math.floor(job.estimatedTime / 60)}h {job.estimatedTime % 60}m</span>
                          )}
                          {job.price && (
                            <span>Price: ${job.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
                No services yet. Add one above.
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Render editor for selected job
  if (editedCategory && editedSubcategory && editedJob) {
    return (
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-2">
            Category: {editedCategory.name} / Subcategory: {editedSubcategory.name}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobName">Service Name</Label>
            <Input 
              id="jobName"
              value={editedJob.name} 
              onChange={(e) => setEditedJob({ ...editedJob, name: e.target.value })} 
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Description</Label>
            <Textarea 
              id="jobDescription"
              value={editedJob.description || ''} 
              onChange={(e) => setEditedJob({ ...editedJob, description: e.target.value })} 
              className="w-full min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Estimated Time (Minutes)</Label>
            <Input 
              id="estimatedTime"
              type="number"
              value={editedJob.estimatedTime || ''} 
              onChange={(e) => setEditedJob({ 
                ...editedJob, 
                estimatedTime: e.target.value ? parseInt(e.target.value) : undefined 
              })} 
              className="w-full"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input 
              id="price"
              type="number"
              value={editedJob.price || ''} 
              onChange={(e) => setEditedJob({ 
                ...editedJob, 
                price: e.target.value ? parseFloat(e.target.value) : undefined 
              })} 
              className="w-full"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="pt-4 flex space-x-2">
            <Button 
              onClick={handleSaveJob}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Service
            </Button>
            
            <Button 
              onClick={handleDeleteJob}
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Service
            </Button>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return null;
};
