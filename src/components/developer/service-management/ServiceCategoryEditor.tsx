
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { AlertCircle, Plus, Trash2, Edit, Save, X, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createEmptySubcategory, createEmptyJob, cloneCategory } from '@/lib/services/serviceUtils';
import { v4 as uuidv4 } from 'uuid';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

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
  const [editableCategory, setEditableCategory] = useState<ServiceMainCategory | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize the editable category when the prop changes
  useEffect(() => {
    if (category) {
      setEditableCategory(cloneCategory(category));
    } else {
      setEditableCategory(null);
    }
    setValidationError(null);
  }, [category]);

  if (!editableCategory) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            No category selected. Please select a category to edit or create a new one.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCategoryChange = (field: keyof ServiceMainCategory, value: any) => {
    setEditableCategory(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSubcategoryChange = (subcategoryId: string, field: keyof ServiceSubcategory, value: any) => {
    setEditableCategory(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        subcategories: prev.subcategories.map(sub => 
          sub.id === subcategoryId 
            ? { ...sub, [field]: value } 
            : sub
        )
      };
    });
  };

  const handleJobChange = (subcategoryId: string, jobId: string, field: keyof ServiceJob, value: any) => {
    setEditableCategory(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        subcategories: prev.subcategories.map(sub => 
          sub.id === subcategoryId 
            ? {
                ...sub,
                jobs: sub.jobs.map(job => 
                  job.id === jobId 
                    ? { ...job, [field]: value } 
                    : job
                )
              } 
            : sub
        )
      };
    });
  };

  const handleAddSubcategory = () => {
    setEditableCategory(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        subcategories: [
          ...prev.subcategories,
          createEmptySubcategory()
        ]
      };
    });
  };

  const handleRemoveSubcategory = (subcategoryId: string) => {
    setEditableCategory(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        subcategories: prev.subcategories.filter(sub => sub.id !== subcategoryId)
      };
    });
  };

  const handleAddJob = (subcategoryId: string) => {
    setEditableCategory(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        subcategories: prev.subcategories.map(sub => 
          sub.id === subcategoryId 
            ? {
                ...sub,
                jobs: [...sub.jobs, createEmptyJob()]
              } 
            : sub
        )
      };
    });
  };

  const handleRemoveJob = (subcategoryId: string, jobId: string) => {
    setEditableCategory(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        subcategories: prev.subcategories.map(sub => 
          sub.id === subcategoryId 
            ? {
                ...sub,
                jobs: sub.jobs.filter(job => job.id !== jobId)
              } 
            : sub
        )
      };
    });
  };

  const handleSave = () => {
    // Validate category name
    if (!editableCategory.name.trim()) {
      setValidationError("Category name is required");
      return;
    }

    // Validate subcategories
    for (const sub of editableCategory.subcategories) {
      if (!sub.name.trim()) {
        setValidationError("Subcategory names are required");
        return;
      }

      // Validate jobs within subcategories
      for (const job of sub.jobs) {
        if (!job.name.trim()) {
          setValidationError("Service names are required");
          return;
        }
      }
    }

    setValidationError(null);
    onSave(editableCategory);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category.id === editableCategory.id ? 'Edit' : 'Create'} Service Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Category Name</label>
            <Input 
              id="name" 
              value={editableCategory.name} 
              onChange={(e) => handleCategoryChange('name', e.target.value)} 
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <Textarea 
              id="description" 
              value={editableCategory.description || ''} 
              onChange={(e) => handleCategoryChange('description', e.target.value)} 
              placeholder="Enter category description"
              rows={2}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Subcategories</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddSubcategory}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Subcategory
              </Button>
            </div>

            {editableCategory.subcategories.length === 0 ? (
              <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                No subcategories yet. Click "Add Subcategory" to create one.
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {editableCategory.subcategories.map((subcategory, index) => (
                  <AccordionItem key={subcategory.id} value={subcategory.id}>
                    <AccordionTrigger className="hover:bg-muted/50 px-2 rounded-md">
                      <div className="flex-1 text-left">
                        {subcategory.name || `Subcategory ${index + 1}`}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-3 border-l-2 ml-2 pl-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Subcategory Name</label>
                            <div className="flex gap-2">
                              <Input 
                                value={subcategory.name} 
                                onChange={(e) => handleSubcategoryChange(subcategory.id, 'name', e.target.value)}
                                placeholder="Enter subcategory name" 
                                className="flex-1"
                              />
                              <Button 
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSubcategory(subcategory.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Textarea 
                              value={subcategory.description || ''} 
                              onChange={(e) => handleSubcategoryChange(subcategory.id, 'description', e.target.value)}
                              placeholder="Enter subcategory description"
                              rows={2}
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium">Services</label>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAddJob(subcategory.id)}
                                className="flex items-center gap-1 text-xs"
                              >
                                <Plus className="h-3 w-3" /> Add Service
                              </Button>
                            </div>

                            {subcategory.jobs.length === 0 ? (
                              <div className="p-3 border border-dashed rounded-md text-center text-muted-foreground text-sm">
                                No services yet. Click "Add Service" to create one.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {subcategory.jobs.map((job) => (
                                  <div key={job.id} className="p-3 rounded-md border bg-muted/20">
                                    <div className="grid gap-3">
                                      <div className="flex items-start gap-2">
                                        <div className="flex-1">
                                          <label className="block text-xs font-medium mb-1">Service Name</label>
                                          <Input 
                                            value={job.name} 
                                            onChange={(e) => handleJobChange(subcategory.id, job.id, 'name', e.target.value)}
                                            placeholder="Enter service name"
                                            size="sm"
                                          />
                                        </div>
                                        <Button 
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveJob(subcategory.id, job.id)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-5"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Est. Time (minutes)</label>
                                          <Input 
                                            type="number"
                                            value={job.estimatedTime || ''} 
                                            onChange={(e) => handleJobChange(subcategory.id, job.id, 'estimatedTime', 
                                              e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="e.g., 60"
                                            size="sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Price ($)</label>
                                          <Input 
                                            type="number"
                                            value={job.price || ''} 
                                            onChange={(e) => handleJobChange(subcategory.id, job.id, 'price', 
                                              e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="e.g., 99.99"
                                            size="sm"
                                          />
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Description</label>
                                        <Textarea 
                                          value={job.description || ''} 
                                          onChange={(e) => handleJobChange(subcategory.id, job.id, 'description', e.target.value)}
                                          placeholder="Enter service description"
                                          rows={2}
                                          className="text-sm"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-6">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} className="gap-1">
          <Save className="h-4 w-4" /> Save Category
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCategoryEditor;
