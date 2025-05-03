
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { createEmptyCategory, createEmptySubcategory, createEmptyJob, cloneCategory } from '@/lib/services/serviceUtils';
import { AccordionItem, AccordionTrigger, AccordionContent, Accordion } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Plus, Trash2, ChevronDown } from "lucide-react";

interface ServiceCategoryEditorProps {
  category: ServiceMainCategory | null;
  onSave: (category: ServiceMainCategory) => void;
  onCancel: () => void;
}

export default function ServiceCategoryEditor({ category, onSave, onCancel }: ServiceCategoryEditorProps) {
  const [editableCategory, setEditableCategory] = useState<ServiceMainCategory | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");

  // Initialize editable copy of the category
  useEffect(() => {
    if (category) {
      setEditableCategory(cloneCategory(category));
    } else {
      setEditableCategory(createEmptyCategory());
    }
  }, [category]);

  if (!editableCategory) {
    return <div>Loading category editor...</div>;
  }

  // Validate the category before saving
  const validateCategory = (cat: ServiceMainCategory): boolean => {
    if (!cat.name.trim()) {
      setValidationMessage("Category name is required");
      setIsValid(false);
      return false;
    }

    // Check if subcategories have names
    for (const sub of cat.subcategories) {
      if (!sub.name.trim()) {
        setValidationMessage("All subcategories must have names");
        setIsValid(false);
        return false;
      }

      // Check if jobs have names
      for (const job of sub.jobs) {
        if (!job.name.trim()) {
          setValidationMessage(`All services in ${sub.name} must have names`);
          setIsValid(false);
          return false;
        }
      }
    }

    setIsValid(true);
    return true;
  };

  // Handle category name change
  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableCategory({
      ...editableCategory,
      name: e.target.value
    });
  };

  // Handle category description change
  const handleCategoryDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableCategory({
      ...editableCategory,
      description: e.target.value
    });
  };

  // Handle subcategory name change
  const handleSubcategoryNameChange = (subcategoryId: string, newName: string) => {
    setEditableCategory({
      ...editableCategory,
      subcategories: editableCategory.subcategories.map(sub =>
        sub.id === subcategoryId ? { ...sub, name: newName } : sub
      )
    });
  };

  // Handle subcategory description change
  const handleSubcategoryDescriptionChange = (subcategoryId: string, newDescription: string) => {
    setEditableCategory({
      ...editableCategory,
      subcategories: editableCategory.subcategories.map(sub =>
        sub.id === subcategoryId ? { ...sub, description: newDescription } : sub
      )
    });
  };

  // Handle job name change
  const handleJobNameChange = (subcategoryId: string, jobId: string, newName: string) => {
    setEditableCategory({
      ...editableCategory,
      subcategories: editableCategory.subcategories.map(sub => {
        if (sub.id === subcategoryId) {
          return {
            ...sub,
            jobs: sub.jobs.map(job => 
              job.id === jobId ? { ...job, name: newName } : job
            )
          };
        }
        return sub;
      })
    });
  };

  // Handle job description change
  const handleJobDescriptionChange = (subcategoryId: string, jobId: string, newDescription: string) => {
    setEditableCategory({
      ...editableCategory,
      subcategories: editableCategory.subcategories.map(sub => {
        if (sub.id === subcategoryId) {
          return {
            ...sub,
            jobs: sub.jobs.map(job => 
              job.id === jobId ? { ...job, description: newDescription } : job
            )
          };
        }
        return sub;
      })
    });
  };

  // Handle job estimated time change
  const handleJobEstimatedTimeChange = (subcategoryId: string, jobId: string, newTime: string) => {
    setEditableCategory({
      ...editableCategory,
      subcategories: editableCategory.subcategories.map(sub => {
        if (sub.id === subcategoryId) {
          return {
            ...sub,
            jobs: sub.jobs.map(job => 
              job.id === jobId ? { ...job, estimatedTime: parseInt(newTime) || 0 } : job
            )
          };
        }
        return sub;
      })
    });
  };

  // Handle job price change
  const handleJobPriceChange = (subcategoryId: string, jobId: string, newPrice: string) => {
    setEditableCategory({
      ...editableCategory,
      subcategories: editableCategory.subcategories.map(sub => {
        if (sub.id === subcategoryId) {
          return {
            ...sub,
            jobs: sub.jobs.map(job => 
              job.id === jobId ? { ...job, price: parseFloat(newPrice) || 0 } : job
            )
          };
        }
        return sub;
      })
    });
  };

  // Add a new subcategory
  const handleAddSubcategory = () => {
    const newSubcategory = createEmptySubcategory();
    setEditableCategory({
      ...editableCategory,
      subcategories: [...editableCategory.subcategories, newSubcategory]
    });
  };

  // Remove a subcategory
  const handleRemoveSubcategory = (subcategoryId: string) => {
    setEditableCategory({
      ...editableCategory,
      subcategories: editableCategory.subcategories.filter(sub => sub.id !== subcategoryId)
    });
  };

  // Add a new job to a subcategory
  const handleAddJob = (subcategoryId: string) => {
    const newJob = createEmptyJob();
    setEditableCategory({
      ...editableCategory,
      subcategories: editableCategory.subcategories.map(sub => {
        if (sub.id === subcategoryId) {
          return {
            ...sub,
            jobs: [...sub.jobs, newJob]
          };
        }
        return sub;
      })
    });
  };

  // Remove a job from a subcategory
  const handleRemoveJob = (subcategoryId: string, jobId: string) => {
    setEditableCategory({
      ...editableCategory,
      subcategories: editableCategory.subcategories.map(sub => {
        if (sub.id === subcategoryId) {
          return {
            ...sub,
            jobs: sub.jobs.filter(job => job.id !== jobId)
          };
        }
        return sub;
      })
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateCategory(editableCategory)) {
      onSave(editableCategory);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {category && category.id ? 'Edit Category' : 'New Category'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isValid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={editableCategory.name}
                onChange={handleCategoryNameChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={editableCategory.description || ''}
                onChange={handleCategoryDescriptionChange}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Subcategories</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddSubcategory}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Subcategory
              </Button>
            </div>
            
            <Accordion type="multiple" className="w-full">
              {editableCategory.subcategories.map(subcategory => (
                <AccordionItem value={subcategory.id} key={subcategory.id} className="border px-4 rounded-md">
                  <AccordionTrigger className="py-2">
                    <div className="flex justify-between w-full pr-4">
                      <span>{subcategory.name || 'Unnamed Subcategory'}</span>
                      <span className="text-gray-500 text-sm">
                        {subcategory.jobs.length} service{subcategory.jobs.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <Label htmlFor={`subcategory-name-${subcategory.id}`}>Name</Label>
                          <Input
                            id={`subcategory-name-${subcategory.id}`}
                            value={subcategory.name}
                            onChange={(e) => handleSubcategoryNameChange(subcategory.id, e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveSubcategory(subcategory.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label htmlFor={`subcategory-desc-${subcategory.id}`}>Description</Label>
                        <Textarea
                          id={`subcategory-desc-${subcategory.id}`}
                          value={subcategory.description || ''}
                          onChange={(e) => handleSubcategoryDescriptionChange(subcategory.id, e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Services</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddJob(subcategory.id)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-4 w-4" /> Add Service
                          </Button>
                        </div>
                        
                        {subcategory.jobs.length === 0 ? (
                          <div className="text-sm text-gray-500 italic">No services added yet</div>
                        ) : (
                          <div className="space-y-4">
                            {subcategory.jobs.map(job => (
                              <div key={job.id} className="border rounded-md p-3 bg-gray-50">
                                <div className="grid grid-cols-12 gap-3">
                                  <div className="col-span-5">
                                    <Label htmlFor={`job-name-${job.id}`}>Service Name</Label>
                                    <Input
                                      id={`job-name-${job.id}`}
                                      value={job.name}
                                      onChange={(e) => handleJobNameChange(subcategory.id, job.id, e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="col-span-3">
                                    <Label htmlFor={`job-time-${job.id}`}>Est. Time (min)</Label>
                                    <Input
                                      id={`job-time-${job.id}`}
                                      type="number"
                                      value={job.estimatedTime || ''}
                                      onChange={(e) => handleJobEstimatedTimeChange(subcategory.id, job.id, e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="col-span-3">
                                    <Label htmlFor={`job-price-${job.id}`}>Price ($)</Label>
                                    <Input
                                      id={`job-price-${job.id}`}
                                      type="number"
                                      value={job.price || ''}
                                      onChange={(e) => handleJobPriceChange(subcategory.id, job.id, e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="col-span-1 flex items-end">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => handleRemoveJob(subcategory.id, job.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <div className="col-span-12 mt-2">
                                    <Label htmlFor={`job-desc-${job.id}`}>Description</Label>
                                    <Textarea
                                      id={`job-desc-${job.id}`}
                                      value={job.description || ''}
                                      onChange={(e) => handleJobDescriptionChange(subcategory.id, job.id, e.target.value)}
                                      className="h-20"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {editableCategory.subcategories.length === 0 && (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-gray-500 mb-4">No subcategories added yet</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddSubcategory}
                  className="flex items-center gap-1 mx-auto"
                >
                  <Plus className="h-4 w-4" /> Add Subcategory
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Category</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
