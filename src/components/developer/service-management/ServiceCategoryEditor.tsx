import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { createEmptyCategory } from '@/lib/services';
import { v4 as uuidv4 } from 'uuid';

interface ServiceCategoryEditorProps {
  category: ServiceMainCategory | null;
  onSave: (category: ServiceMainCategory) => void;
  onCancel: () => void;
}

export default function ServiceCategoryEditor({
  category,
  onSave,
  onCancel
}: ServiceCategoryEditorProps) {
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory>({
    id: '',
    name: '',
    description: '',
    subcategories: [],
    position: 0
  });

  useEffect(() => {
    if (category) {
      setEditedCategory({...category});
    } else {
      // Reset to empty state if no category provided
      setEditedCategory({
        id: uuidv4(),
        name: '',
        description: '',
        subcategories: [],
        position: 0
      });
    }
  }, [category]);
  
  // Handle main category field changes
  const handleCategoryChange = (field: keyof ServiceMainCategory, value: any) => {
    setEditedCategory(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Add a new subcategory
  const handleAddSubcategory = () => {
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: '',
      description: '',
      jobs: []
    };
    
    setEditedCategory(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, newSubcategory]
    }));
  };
  
  // Update a subcategory
  const handleUpdateSubcategory = (index: number, field: keyof ServiceSubcategory, value: any) => {
    setEditedCategory(prev => {
      const updatedSubcategories = [...prev.subcategories];
      updatedSubcategories[index] = {
        ...updatedSubcategories[index],
        [field]: value
      };
      return {
        ...prev,
        subcategories: updatedSubcategories
      };
    });
  };
  
  // Delete a subcategory
  const handleDeleteSubcategory = (index: number) => {
    setEditedCategory(prev => {
      const updatedSubcategories = [...prev.subcategories];
      updatedSubcategories.splice(index, 1);
      return {
        ...prev,
        subcategories: updatedSubcategories
      };
    });
  };
  
  // Add a new job to a subcategory
  const handleAddJob = (subcategoryIndex: number) => {
    const newJob: ServiceJob = {
      id: uuidv4(),
      name: '',
      description: '',
      estimatedTime: 0,
      price: 0
    };
    
    setEditedCategory(prev => {
      const updatedSubcategories = [...prev.subcategories];
      updatedSubcategories[subcategoryIndex] = {
        ...updatedSubcategories[subcategoryIndex],
        jobs: [...updatedSubcategories[subcategoryIndex].jobs, newJob]
      };
      return {
        ...prev,
        subcategories: updatedSubcategories
      };
    });
  };
  
  // Update a job
  const handleUpdateJob = (subcategoryIndex: number, jobIndex: number, field: keyof ServiceJob, value: any) => {
    setEditedCategory(prev => {
      const updatedSubcategories = [...prev.subcategories];
      const updatedJobs = [...updatedSubcategories[subcategoryIndex].jobs];
      
      updatedJobs[jobIndex] = {
        ...updatedJobs[jobIndex],
        [field]: value
      };
      
      updatedSubcategories[subcategoryIndex] = {
        ...updatedSubcategories[subcategoryIndex],
        jobs: updatedJobs
      };
      
      return {
        ...prev,
        subcategories: updatedSubcategories
      };
    });
  };
  
  // Delete a job
  const handleDeleteJob = (subcategoryIndex: number, jobIndex: number) => {
    setEditedCategory(prev => {
      const updatedSubcategories = [...prev.subcategories];
      const updatedJobs = [...updatedSubcategories[subcategoryIndex].jobs];
      
      updatedJobs.splice(jobIndex, 1);
      
      updatedSubcategories[subcategoryIndex] = {
        ...updatedSubcategories[subcategoryIndex],
        jobs: updatedJobs
      };
      
      return {
        ...prev,
        subcategories: updatedSubcategories
      };
    });
  };
  
  const handleSave = () => {
    onSave(editedCategory);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{category && category.id ? 'Edit Category' : 'New Category'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input 
              id="categoryName" 
              value={editedCategory.name} 
              onChange={(e) => handleCategoryChange('name', e.target.value)}
              placeholder="Enter category name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="categoryDescription">Description</Label>
            <Textarea 
              id="categoryDescription" 
              value={editedCategory.description || ''} 
              onChange={(e) => handleCategoryChange('description', e.target.value)}
              placeholder="Enter category description (optional)"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!editedCategory.name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Category
          </Button>
        </CardFooter>
      </Card>
      
      {editedCategory.id && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Subcategories</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddSubcategory}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Subcategory
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {editedCategory.subcategories.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md">
                No subcategories added yet. Add your first subcategory.
              </div>
            ) : (
              editedCategory.subcategories.map((subcategory, subcatIndex) => (
                <Card key={subcategory.id} className="mb-4">
                  <CardHeader className="p-4 bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div className="grid gap-2 flex-1 mr-2">
                        <Input 
                          value={subcategory.name} 
                          onChange={(e) => handleUpdateSubcategory(subcatIndex, 'name', e.target.value)}
                          placeholder="Subcategory name"
                          className="font-medium"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteSubcategory(subcatIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <Label htmlFor={`subcategory-${subcatIndex}-description`}>Description</Label>
                      <Textarea 
                        id={`subcategory-${subcatIndex}-description`}
                        value={subcategory.description || ''}
                        onChange={(e) => handleUpdateSubcategory(subcatIndex, 'description', e.target.value)}
                        placeholder="Subcategory description (optional)"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Jobs</Label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddJob(subcatIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Job
                        </Button>
                      </div>
                      
                      {subcategory.jobs.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground border border-dashed rounded-md">
                          No jobs added yet
                        </div>
                      ) : (
                        <div className="space-y-3 mt-2">
                          {subcategory.jobs.map((job, jobIndex) => (
                            <Card key={job.id} className="p-3 bg-white">
                              <div className="flex justify-between items-start">
                                <div className="grid gap-2 flex-1 mr-2">
                                  <Input 
                                    value={job.name}
                                    onChange={(e) => handleUpdateJob(subcatIndex, jobIndex, 'name', e.target.value)}
                                    placeholder="Job name"
                                    className="mb-2"
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label htmlFor={`job-${subcatIndex}-${jobIndex}-time`} className="text-xs">Est. Time (mins)</Label>
                                      <Input 
                                        id={`job-${subcatIndex}-${jobIndex}-time`}
                                        type="number"
                                        min="0"
                                        value={job.estimatedTime || ''}
                                        onChange={(e) => handleUpdateJob(subcatIndex, jobIndex, 'estimatedTime', Number(e.target.value))}
                                        placeholder="Time in minutes"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`job-${subcatIndex}-${jobIndex}-price`} className="text-xs">Price</Label>
                                      <Input 
                                        id={`job-${subcatIndex}-${jobIndex}-price`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={job.price || ''}
                                        onChange={(e) => handleUpdateJob(subcatIndex, jobIndex, 'price', Number(e.target.value))}
                                        placeholder="Price"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 h-8 w-8 p-0"
                                  onClick={() => handleDeleteJob(subcatIndex, jobIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
