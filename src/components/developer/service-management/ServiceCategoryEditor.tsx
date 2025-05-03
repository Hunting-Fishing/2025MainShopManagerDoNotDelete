
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEmptyCategory } from "@/lib/services";

interface ServiceCategoryEditorProps {
  category: ServiceMainCategory | null;
  onSave: (category: ServiceMainCategory) => void;
  onCancel: () => void;
}

export default function ServiceCategoryEditor({ 
  category: initialCategory, 
  onSave, 
  onCancel 
}: ServiceCategoryEditorProps) {
  const [category, setCategory] = useState<ServiceMainCategory>(
    initialCategory || {
      id: uuidv4(),
      name: "",
      description: "",
      position: 0,
      subcategories: []
    }
  );
  const [isNew, setIsNew] = useState(!initialCategory);
  const [errors, setErrors] = useState({
    name: '',
    subcategories: ''
  });
  
  // Reset form when the initial category changes
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      setIsNew(false);
    } else {
      setCategory(createEmptyCategory());
      setIsNew(true);
    }
  }, [initialCategory]);

  // Update category name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory({ ...category, name: e.target.value });
    if (e.target.value) {
      setErrors({ ...errors, name: '' });
    }
  };

  // Update category description
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCategory({ ...category, description: e.target.value });
  };

  // Add new subcategory
  const handleAddSubcategory = () => {
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: "New Subcategory",
      description: "",
      jobs: []
    };
    
    setCategory({
      ...category,
      subcategories: [...category.subcategories, newSubcategory]
    });
    
    // Clear subcategories error if present
    if (errors.subcategories) {
      setErrors({ ...errors, subcategories: '' });
    }
  };

  // Update subcategory name
  const handleSubcategoryNameChange = (subcategoryId: string, value: string) => {
    setCategory({
      ...category,
      subcategories: category.subcategories.map(sub => 
        sub.id === subcategoryId ? { ...sub, name: value } : sub
      )
    });
  };

  // Update subcategory description
  const handleSubcategoryDescriptionChange = (subcategoryId: string, value: string) => {
    setCategory({
      ...category,
      subcategories: category.subcategories.map(sub => 
        sub.id === subcategoryId ? { ...sub, description: value } : sub
      )
    });
  };

  // Delete a subcategory
  const handleDeleteSubcategory = (subcategoryId: string) => {
    setCategory({
      ...category,
      subcategories: category.subcategories.filter(sub => sub.id !== subcategoryId)
    });
  };

  // Add job to subcategory
  const handleAddJob = (subcategoryId: string) => {
    const newJob: ServiceJob = {
      id: uuidv4(),
      name: "New Service",
      description: "",
      estimatedTime: 60, // Default 60 minutes
      price: null
    };
    
    setCategory({
      ...category,
      subcategories: category.subcategories.map(sub => 
        sub.id === subcategoryId 
          ? { ...sub, jobs: [...sub.jobs, newJob] }
          : sub
      )
    });
  };

  // Update job name
  const handleJobNameChange = (subcategoryId: string, jobId: string, value: string) => {
    setCategory({
      ...category,
      subcategories: category.subcategories.map(sub => 
        sub.id === subcategoryId 
          ? { 
              ...sub, 
              jobs: sub.jobs.map(job => 
                job.id === jobId ? { ...job, name: value } : job
              ) 
            }
          : sub
      )
    });
  };

  // Update job time estimate
  const handleJobTimeChange = (subcategoryId: string, jobId: string, value: string) => {
    // Convert to number, default to null if empty or invalid
    const numValue = value ? parseFloat(value) : null;
    
    setCategory({
      ...category,
      subcategories: category.subcategories.map(sub => 
        sub.id === subcategoryId 
          ? { 
              ...sub, 
              jobs: sub.jobs.map(job => 
                job.id === jobId ? { ...job, estimatedTime: numValue as number } : job
              ) 
            }
          : sub
      )
    });
  };

  // Update job price
  const handleJobPriceChange = (subcategoryId: string, jobId: string, value: string) => {
    // Convert to number, default to null if empty or invalid
    const numValue = value ? parseFloat(value) : null;
    
    setCategory({
      ...category,
      subcategories: category.subcategories.map(sub => 
        sub.id === subcategoryId 
          ? { 
              ...sub, 
              jobs: sub.jobs.map(job => 
                job.id === jobId ? { ...job, price: numValue } : job
              ) 
            }
          : sub
      )
    });
  };

  // Delete a job
  const handleDeleteJob = (subcategoryId: string, jobId: string) => {
    setCategory({
      ...category,
      subcategories: category.subcategories.map(sub => 
        sub.id === subcategoryId 
          ? { 
              ...sub, 
              jobs: sub.jobs.filter(job => job.id !== jobId) 
            }
          : sub
      )
    });
  };

  // Save the category
  const handleSave = () => {
    // Validation
    let hasErrors = false;
    const newErrors = {
      name: '',
      subcategories: ''
    };
    
    if (!category.name.trim()) {
      newErrors.name = 'Category name is required';
      hasErrors = true;
    }
    
    if (category.subcategories.length === 0) {
      newErrors.subcategories = 'At least one subcategory is required';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    onSave(category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {isNew ? "Create New Service Category" : "Edit Service Category"}
        </h3>
        <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name <span className="text-red-500">*</span></Label>
            <Input 
              id="category-name"
              value={category.name} 
              onChange={handleNameChange} 
              placeholder="Enter category name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">Category Description</Label>
            <Textarea 
              id="category-description"
              value={category.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Enter category description"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Category
          </Button>
        </CardFooter>
      </Card>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Subcategories</h3>
          <Button 
            onClick={handleAddSubcategory} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Subcategory
          </Button>
        </div>
        
        {errors.subcategories && (
          <Alert variant="destructive">
            <AlertDescription>{errors.subcategories}</AlertDescription>
          </Alert>
        )}
        
        {category.subcategories.length === 0 ? (
          <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
            <p className="text-slate-500">No subcategories added yet</p>
            <Button 
              onClick={handleAddSubcategory} 
              variant="secondary" 
              size="sm" 
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Your First Subcategory
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {category.subcategories.map((subcategory) => (
              <Card key={subcategory.id} className="relative">
                <CardHeader>
                  <div className="space-y-2">
                    <Label htmlFor={`subcategory-${subcategory.id}-name`}>Subcategory Name <span className="text-red-500">*</span></Label>
                    <Input
                      id={`subcategory-${subcategory.id}-name`}
                      value={subcategory.name}
                      onChange={(e) => handleSubcategoryNameChange(subcategory.id, e.target.value)}
                      placeholder="Subcategory name"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`subcategory-${subcategory.id}-description`}>Description</Label>
                    <Textarea
                      id={`subcategory-${subcategory.id}-description`}
                      value={subcategory.description || ''}
                      onChange={(e) => handleSubcategoryDescriptionChange(subcategory.id, e.target.value)}
                      placeholder="Subcategory description"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Services</h4>
                      <Button 
                        onClick={() => handleAddJob(subcategory.id)} 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add Service
                      </Button>
                    </div>
                    
                    {subcategory.jobs.length === 0 ? (
                      <div className="text-center p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-500">No services added yet</p>
                        <Button 
                          onClick={() => handleAddJob(subcategory.id)} 
                          variant="ghost" 
                          size="sm" 
                          className="mt-1 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Service
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {subcategory.jobs.map((job) => (
                          <div key={job.id} className="flex flex-wrap gap-2 items-center p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1 min-w-[200px]">
                              <Label htmlFor={`job-${job.id}-name`} className="text-xs mb-1 block">Service Name <span className="text-red-500">*</span></Label>
                              <Input
                                id={`job-${job.id}-name`}
                                value={job.name}
                                onChange={(e) => handleJobNameChange(subcategory.id, job.id, e.target.value)}
                                placeholder="Service name"
                                className="h-8"
                              />
                            </div>
                            <div className="w-24">
                              <Label htmlFor={`job-${job.id}-time`} className="text-xs mb-1 block">Time (min)</Label>
                              <Input
                                id={`job-${job.id}-time`}
                                type="number"
                                value={job.estimatedTime?.toString() || ''}
                                onChange={(e) => handleJobTimeChange(subcategory.id, job.id, e.target.value)}
                                placeholder="Time"
                                className="h-8"
                              />
                            </div>
                            <div className="w-24">
                              <Label htmlFor={`job-${job.id}-price`} className="text-xs mb-1 block">Price ($)</Label>
                              <Input
                                id={`job-${job.id}-price`}
                                type="number"
                                value={job.price?.toString() || ''}
                                onChange={(e) => handleJobPriceChange(subcategory.id, job.id, e.target.value)}
                                placeholder="Price"
                                className="h-8"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteJob(subcategory.id, job.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteSubcategory(subcategory.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete Subcategory
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" /> {isNew ? "Create Category" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
