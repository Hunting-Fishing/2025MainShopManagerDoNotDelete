
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { Plus, Trash2, Edit2, Save, X, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { createEmptySubcategory, createEmptyJob } from '@/lib/services/serviceUtils';
import { formatTime } from '@/lib/services/serviceUtils';
import { cn } from '@/lib/utils';

interface ServiceCategoryEditorProps {
  category: ServiceMainCategory | null;
  onSave: (category: ServiceMainCategory) => void;
  onCancel: () => void;
}

const ServiceCategoryEditor: React.FC<ServiceCategoryEditorProps> = ({
  category,
  onSave,
  onCancel,
}) => {
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory | null>(
    category ? { ...JSON.parse(JSON.stringify(category)) } : null
  );
  
  const [expandedSubcategoryId, setExpandedSubcategoryId] = useState<string | null>(null);

  if (!editedCategory) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            Please select a category to edit or create a new one.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedCategory({
      ...editedCategory,
      [name]: value,
    });
  };

  const handleSubcategoryChange = (subcategoryId: string, field: string, value: string) => {
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(subcategory =>
        subcategory.id === subcategoryId
          ? { ...subcategory, [field]: value }
          : subcategory
      ),
    });
  };

  const handleJobChange = (subcategoryId: string, jobId: string, field: string, value: string | number) => {
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(subcategory =>
        subcategory.id === subcategoryId
          ? {
              ...subcategory,
              jobs: subcategory.jobs.map(job =>
                job.id === jobId
                  ? { ...job, [field]: field === 'estimatedTime' || field === 'price' ? Number(value) : value }
                  : job
              ),
            }
          : subcategory
      ),
    });
  };

  const handleAddSubcategory = () => {
    const newSubcategory = createEmptySubcategory();
    
    setEditedCategory({
      ...editedCategory,
      subcategories: [...editedCategory.subcategories, newSubcategory],
    });
    
    // Auto-expand the newly created subcategory
    setExpandedSubcategoryId(newSubcategory.id);
  };

  const handleRemoveSubcategory = (id: string) => {
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories.filter(subcategory => subcategory.id !== id),
    });
    
    // If removing the currently expanded subcategory, collapse it
    if (expandedSubcategoryId === id) {
      setExpandedSubcategoryId(null);
    }
  };

  const handleAddJob = (subcategoryId: string) => {
    const newJob = createEmptyJob();
    
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(subcategory =>
        subcategory.id === subcategoryId
          ? {
              ...subcategory,
              jobs: [...subcategory.jobs, newJob],
            }
          : subcategory
      ),
    });
  };

  const handleRemoveJob = (subcategoryId: string, jobId: string) => {
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(subcategory =>
        subcategory.id === subcategoryId
          ? {
              ...subcategory,
              jobs: subcategory.jobs.filter(job => job.id !== jobId),
            }
          : subcategory
      ),
    });
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategoryId(expandedSubcategoryId === subcategoryId ? null : subcategoryId);
  };

  const handleSave = () => {
    if (editedCategory) {
      onSave(editedCategory);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <h2 className="text-xl font-bold">
          {editedCategory.id ? `Edit Category: ${category?.name}` : 'Create New Category'}
        </h2>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Category Info */}
        <div className="grid gap-4">
          <div>
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              name="name"
              value={editedCategory.name}
              onChange={handleCategoryChange}
              placeholder="Main Category Name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="category-description">Description (Optional)</Label>
            <Textarea
              id="category-description"
              name="description"
              value={editedCategory.description || ''}
              onChange={handleCategoryChange}
              placeholder="Description of this service category"
              className="mt-1"
            />
          </div>
        </div>

        {/* Subcategories */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Subcategories</h3>
            <Button 
              onClick={handleAddSubcategory} 
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Subcategory
            </Button>
          </div>
          
          <div className="space-y-3">
            {editedCategory.subcategories.length === 0 ? (
              <div className="text-center py-4 border border-dashed rounded-md bg-muted/50">
                No subcategories yet. Add one to get started.
              </div>
            ) : (
              editedCategory.subcategories.map(subcategory => (
                <div key={subcategory.id} className="border rounded-md">
                  {/* Subcategory Header */}
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSubcategory(subcategory.id)}
                  >
                    <div className="font-medium">{subcategory.name || 'Unnamed Subcategory'}</div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSubcategory(subcategory.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform", 
                          expandedSubcategoryId === subcategory.id ? "transform rotate-180" : ""
                        )} 
                      />
                    </div>
                  </div>
                  
                  {/* Subcategory Content (expandable) */}
                  {expandedSubcategoryId === subcategory.id && (
                    <div className="p-4 border-t bg-muted/20">
                      <div className="space-y-4">
                        {/* Subcategory Details */}
                        <div className="grid gap-3">
                          <div>
                            <Label>Subcategory Name</Label>
                            <Input
                              value={subcategory.name}
                              onChange={(e) => handleSubcategoryChange(subcategory.id, 'name', e.target.value)}
                              placeholder="Subcategory Name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Description (Optional)</Label>
                            <Textarea
                              value={subcategory.description || ''}
                              onChange={(e) => handleSubcategoryChange(subcategory.id, 'description', e.target.value)}
                              placeholder="Subcategory description"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        {/* Jobs */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
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
                            <div className="text-center py-3 border border-dashed rounded-md bg-muted/30">
                              No services yet. Add one to get started.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {subcategory.jobs.map(job => (
                                <div key={job.id} className="grid gap-2 p-3 border rounded-md bg-white">
                                  <div className="flex justify-between">
                                    <Label>Service Name</Label>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveJob(subcategory.id, job.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                  <Input
                                    value={job.name}
                                    onChange={(e) => handleJobChange(subcategory.id, job.id, 'name', e.target.value)}
                                    placeholder="Service Name"
                                  />
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                    <div>
                                      <Label>Est. Time (minutes)</Label>
                                      <Input
                                        type="number"
                                        value={job.estimatedTime || ''}
                                        onChange={(e) => handleJobChange(subcategory.id, job.id, 'estimatedTime', e.target.value)}
                                        placeholder="60"
                                      />
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {job.estimatedTime ? `Displayed as: ${formatTime(job.estimatedTime)}` : ''}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Price ($)</Label>
                                      <Input
                                        type="number"
                                        value={job.price || ''}
                                        onChange={(e) => handleJobChange(subcategory.id, job.id, 'price', e.target.value)}
                                        placeholder="0.00"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>Description (Optional)</Label>
                                    <Textarea
                                      value={job.description || ''}
                                      onChange={(e) => handleJobChange(subcategory.id, job.id, 'description', e.target.value)}
                                      placeholder="Service description"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save Category
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCategoryEditor;
