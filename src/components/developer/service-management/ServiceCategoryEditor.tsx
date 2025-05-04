
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, X, Trash2, ChevronDown, ChevronUp, Edit, Pencil } from "lucide-react";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { createEmptyCategory, createEmptySubcategory, createEmptyJob } from '@/lib/services/serviceUtils';

interface ServiceCategoryEditorProps {
  category: ServiceMainCategory | null;
  onSave: (category: ServiceMainCategory) => void;
  onCancel: () => void;
}

const ServiceCategoryEditor: React.FC<ServiceCategoryEditorProps> = ({ 
  category,
  onSave,
  onCancel
}) => {
  const [workingCategory, setWorkingCategory] = useState<ServiceMainCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);

  // Create a deep copy of the category when it changes
  useEffect(() => {
    if (category) {
      setWorkingCategory(JSON.parse(JSON.stringify(category)));
    } else {
      setWorkingCategory(null);
    }
    setError(null);
    setEditingSubcategoryId(null);
  }, [category]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workingCategory) return;
    setWorkingCategory({ ...workingCategory, name: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!workingCategory) return;
    setWorkingCategory({ ...workingCategory, description: e.target.value });
  };

  const handleSubcategoryNameChange = (subcategoryId: string, newName: string) => {
    if (!workingCategory) return;
    
    const updatedSubcategories = workingCategory.subcategories.map(subcategory => 
      subcategory.id === subcategoryId ? { ...subcategory, name: newName } : subcategory
    );
    
    setWorkingCategory({
      ...workingCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleSubcategoryDescriptionChange = (subcategoryId: string, newDescription: string) => {
    if (!workingCategory) return;
    
    const updatedSubcategories = workingCategory.subcategories.map(subcategory => 
      subcategory.id === subcategoryId ? { ...subcategory, description: newDescription } : subcategory
    );
    
    setWorkingCategory({
      ...workingCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleAddSubcategory = () => {
    if (!workingCategory) return;
    
    const newSubcategory = createEmptySubcategory();
    setWorkingCategory({
      ...workingCategory,
      subcategories: [...workingCategory.subcategories, newSubcategory]
    });
    
    // Start editing the new subcategory
    setEditingSubcategoryId(newSubcategory.id);
  };

  const handleRemoveSubcategory = (subcategoryId: string) => {
    if (!workingCategory) return;
    
    const updatedSubcategories = workingCategory.subcategories.filter(
      subcategory => subcategory.id !== subcategoryId
    );
    
    setWorkingCategory({
      ...workingCategory,
      subcategories: updatedSubcategories
    });
    
    if (editingSubcategoryId === subcategoryId) {
      setEditingSubcategoryId(null);
    }
  };

  const handleToggleEditSubcategory = (subcategoryId: string) => {
    setEditingSubcategoryId(editingSubcategoryId === subcategoryId ? null : subcategoryId);
  };

  const handleJobNameChange = (subcategoryId: string, jobId: string, newName: string) => {
    if (!workingCategory) return;
    
    const updatedSubcategories = workingCategory.subcategories.map(subcategory => {
      if (subcategory.id === subcategoryId) {
        const updatedJobs = subcategory.jobs.map(job => 
          job.id === jobId ? { ...job, name: newName } : job
        );
        return { ...subcategory, jobs: updatedJobs };
      }
      return subcategory;
    });
    
    setWorkingCategory({
      ...workingCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleJobDescriptionChange = (subcategoryId: string, jobId: string, newDescription: string) => {
    if (!workingCategory) return;
    
    const updatedSubcategories = workingCategory.subcategories.map(subcategory => {
      if (subcategory.id === subcategoryId) {
        const updatedJobs = subcategory.jobs.map(job => 
          job.id === jobId ? { ...job, description: newDescription } : job
        );
        return { ...subcategory, jobs: updatedJobs };
      }
      return subcategory;
    });
    
    setWorkingCategory({
      ...workingCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleJobEstimatedTimeChange = (subcategoryId: string, jobId: string, newTime: string) => {
    if (!workingCategory) return;
    
    const updatedSubcategories = workingCategory.subcategories.map(subcategory => {
      if (subcategory.id === subcategoryId) {
        const updatedJobs = subcategory.jobs.map(job => 
          job.id === jobId ? { ...job, estimatedTime: Number(newTime) } : job
        );
        return { ...subcategory, jobs: updatedJobs };
      }
      return subcategory;
    });
    
    setWorkingCategory({
      ...workingCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleJobPriceChange = (subcategoryId: string, jobId: string, newPrice: string) => {
    if (!workingCategory) return;
    
    const updatedSubcategories = workingCategory.subcategories.map(subcategory => {
      if (subcategory.id === subcategoryId) {
        const updatedJobs = subcategory.jobs.map(job => 
          job.id === jobId ? { ...job, price: Number(newPrice) } : job
        );
        return { ...subcategory, jobs: updatedJobs };
      }
      return subcategory;
    });
    
    setWorkingCategory({
      ...workingCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleAddJob = (subcategoryId: string) => {
    if (!workingCategory) return;
    
    const updatedSubcategories = workingCategory.subcategories.map(subcategory => {
      if (subcategory.id === subcategoryId) {
        const newJob = createEmptyJob();
        return { ...subcategory, jobs: [...subcategory.jobs, newJob] };
      }
      return subcategory;
    });
    
    setWorkingCategory({
      ...workingCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleRemoveJob = (subcategoryId: string, jobId: string) => {
    if (!workingCategory) return;
    
    const updatedSubcategories = workingCategory.subcategories.map(subcategory => {
      if (subcategory.id === subcategoryId) {
        const updatedJobs = subcategory.jobs.filter(job => job.id !== jobId);
        return { ...subcategory, jobs: updatedJobs };
      }
      return subcategory;
    });
    
    setWorkingCategory({
      ...workingCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleSubmit = () => {
    if (!workingCategory) return;
    
    // Basic validation
    if (!workingCategory.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    // Check for duplicate subcategory names
    const subcategoryNames = workingCategory.subcategories.map(s => s.name.trim().toLowerCase());
    if (new Set(subcategoryNames).size !== subcategoryNames.length) {
      setError("Duplicate subcategory names are not allowed");
      return;
    }
    
    // Check that all jobs have names
    let hasEmptyJobName = false;
    workingCategory.subcategories.forEach(subcategory => {
      subcategory.jobs.forEach(job => {
        if (!job.name.trim()) {
          hasEmptyJobName = true;
        }
      });
    });
    
    if (hasEmptyJobName) {
      setError("All services must have names");
      return;
    }
    
    onSave(workingCategory);
  };

  if (!workingCategory) {
    return <div>No category selected</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {category?.id ? "Edit Category" : "New Category"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input 
                id="name"
                value={workingCategory.name} 
                onChange={handleNameChange} 
                placeholder="Category name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={workingCategory.description || ''} 
                onChange={handleDescriptionChange} 
                placeholder="Category description (optional)"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subcategories</CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddSubcategory}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subcategory</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {workingCategory.subcategories.length === 0 ? (
            <div className="text-center p-6 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">No subcategories yet</p>
              <p className="text-sm mt-2">Add subcategories to organize your services</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workingCategory.subcategories.map((subcategory, index) => (
                <Card key={subcategory.id} className="border-esm-blue-100">
                  <CardHeader className="bg-esm-blue-50/30 flex flex-row items-center justify-between py-3">
                    <div className="flex-1">
                      {editingSubcategoryId === subcategory.id ? (
                        <div className="flex flex-col gap-2">
                          <Input 
                            value={subcategory.name}
                            onChange={(e) => handleSubcategoryNameChange(subcategory.id, e.target.value)}
                            placeholder="Subcategory name"
                            className="font-medium"
                          />
                          <Textarea
                            value={subcategory.description || ''}
                            onChange={(e) => handleSubcategoryDescriptionChange(subcategory.id, e.target.value)}
                            placeholder="Description (optional)"
                            className="text-sm"
                            rows={2}
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-md font-medium">{subcategory.name}</h3>
                          {subcategory.description && (
                            <p className="text-sm text-muted-foreground mt-1">{subcategory.description}</p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleToggleEditSubcategory(subcategory.id)}
                      >
                        {editingSubcategoryId === subcategory.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => handleRemoveSubcategory(subcategory.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium">Services</h4>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleAddJob(subcategory.id)}
                        className="flex items-center gap-1 text-xs h-7"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Service</span>
                      </Button>
                    </div>
                    
                    {subcategory.jobs.length === 0 ? (
                      <div className="text-sm text-muted-foreground italic border border-dashed p-3 rounded-md text-center">
                        No services added yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {subcategory.jobs.map((job) => (
                          <div 
                            key={job.id} 
                            className="bg-muted/20 p-3 rounded-md border relative"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveJob(subcategory.id, job.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            
                            <div className="grid gap-3 pr-8">
                              <div>
                                <Label htmlFor={`job-name-${job.id}`} className="text-xs">Service Name</Label>
                                <Input
                                  id={`job-name-${job.id}`}
                                  value={job.name}
                                  onChange={(e) => handleJobNameChange(subcategory.id, job.id, e.target.value)}
                                  placeholder="Service name"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`job-description-${job.id}`} className="text-xs">Description</Label>
                                <Textarea
                                  id={`job-description-${job.id}`}
                                  value={job.description || ''}
                                  onChange={(e) => handleJobDescriptionChange(subcategory.id, job.id, e.target.value)}
                                  placeholder="Description (optional)"
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`job-time-${job.id}`} className="text-xs">Est. Time (minutes)</Label>
                                  <Input
                                    id={`job-time-${job.id}`}
                                    type="number"
                                    value={job.estimatedTime || ''}
                                    onChange={(e) => handleJobEstimatedTimeChange(subcategory.id, job.id, e.target.value)}
                                    placeholder="Estimated time"
                                    className="mt-1"
                                    min={0}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor={`job-price-${job.id}`} className="text-xs">Price ($)</Label>
                                  <Input
                                    id={`job-price-${job.id}`}
                                    type="number"
                                    value={job.price || ''}
                                    onChange={(e) => handleJobPriceChange(subcategory.id, job.id, e.target.value)}
                                    placeholder="Price"
                                    className="mt-1"
                                    min={0}
                                    step={0.01}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CardFooter className="flex justify-end gap-4 px-0">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Save Category</Button>
      </CardFooter>
    </div>
  );
};

export default ServiceCategoryEditor;
