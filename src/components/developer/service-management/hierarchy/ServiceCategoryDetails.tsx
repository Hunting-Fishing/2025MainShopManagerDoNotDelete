
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash, Plus, Save, AlertCircle } from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogDescription, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { createEmptySubcategory, createEmptyJob, formatTime } from '@/lib/services/serviceUtils';

export interface CategoryColorStyle {
  bg: string;
  text: string;
  border: string;
}

interface ServiceCategoryDetailsProps {
  category: ServiceMainCategory;
  onSave: (category: ServiceMainCategory) => Promise<boolean>;
  onDelete: (categoryId: string) => Promise<void>;
  colorStyle: CategoryColorStyle;
}

export const ServiceCategoryDetails: React.FC<ServiceCategoryDetailsProps> = ({
  category,
  onSave,
  onDelete,
  colorStyle
}) => {
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory>({...category});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  const updateCategory = (field: keyof ServiceMainCategory, value: any) => {
    setEditedCategory({
      ...editedCategory,
      [field]: value
    });
  };

  const updateSubcategory = (subcategoryId: string, field: keyof ServiceSubcategory, value: any) => {
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories?.map(sub => 
        sub.id === subcategoryId ? { ...sub, [field]: value } : sub
      ) || []
    });
  };

  const updateJob = (subcategoryId: string, jobId: string, field: keyof ServiceJob, value: any) => {
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories?.map(sub => 
        sub.id === subcategoryId 
          ? { 
              ...sub, 
              jobs: sub.jobs?.map(job => 
                job.id === jobId ? { ...job, [field]: value } : job
              ) 
            } 
          : sub
      ) || []
    });
  };

  const handleAddSubcategory = () => {
    const newSubcategory = createEmptySubcategory();
    setEditedCategory({
      ...editedCategory,
      subcategories: [...(editedCategory.subcategories || []), newSubcategory]
    });
    
    // Automatically expand the new subcategory
    setExpandedSubcategories(prev => ({
      ...prev,
      [newSubcategory.id]: true
    }));
  };

  const handleAddJob = (subcategoryId: string) => {
    const newJob = createEmptyJob();
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories?.map(sub => 
        sub.id === subcategoryId 
          ? { ...sub, jobs: [...(sub.jobs || []), newJob] } 
          : sub
      ) || []
    });
  };

  const handleDeleteSubcategory = (subcategoryId: string) => {
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories?.filter(sub => sub.id !== subcategoryId) || []
    });
  };

  const handleDeleteJob = (subcategoryId: string, jobId: string) => {
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories?.map(sub => 
        sub.id === subcategoryId 
          ? { ...sub, jobs: sub.jobs?.filter(job => job.id !== jobId) } 
          : sub
      ) || []
    });
  };

  const handleSaveCategory = async () => {
    setIsSaving(true);
    try {
      await onSave(editedCategory);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full ${colorStyle.bg}`}></div>
          <h2 className="ml-2 text-xl font-semibold">
            {editedCategory.name || "Unnamed Category"}
          </h2>
        </div>
        <div className="space-x-2">
          <Button 
            onClick={handleSaveCategory} 
            disabled={isSaving}
            variant="default"
            size="sm"
          >
            {isSaving ? (
              <>Saving</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </>
            )}
          </Button>
          <Button 
            onClick={() => setIsDeleteDialogOpen(true)} 
            variant="destructive"
            size="sm"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input 
              id="category-name" 
              value={editedCategory.name} 
              onChange={(e) => updateCategory('name', e.target.value)}
              placeholder="Enter category name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea 
              id="category-description" 
              value={editedCategory.description || ''} 
              onChange={(e) => updateCategory('description', e.target.value)}
              placeholder="Enter category description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Subcategories ({editedCategory.subcategories?.length || 0})
        </h3>
        <Button onClick={handleAddSubcategory} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Subcategory
        </Button>
      </div>

      <div className="space-y-4">
        {editedCategory.subcategories?.length === 0 && (
          <div className="text-center p-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">No subcategories yet. Add your first one to get started.</p>
          </div>
        )}
        
        {editedCategory.subcategories?.map((subcategory) => (
          <Card key={subcategory.id} className={`border ${colorStyle.border}`}>
            <CardHeader className="py-3 cursor-pointer" onClick={() => toggleSubcategory(subcategory.id)}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center">
                  {subcategory.name || "Unnamed Subcategory"}
                  <span className="ml-2 text-sm text-muted-foreground font-normal">
                    ({subcategory.jobs?.length || 0} services)
                  </span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubcategory(subcategory.id);
                    }}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {expandedSubcategories[subcategory.id] && (
              <CardContent className="space-y-6 pt-0">
                <div className="space-y-2">
                  <Label htmlFor={`subcategory-name-${subcategory.id}`}>Name</Label>
                  <Input 
                    id={`subcategory-name-${subcategory.id}`} 
                    value={subcategory.name} 
                    onChange={(e) => updateSubcategory(subcategory.id, 'name', e.target.value)}
                    placeholder="Enter subcategory name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`subcategory-description-${subcategory.id}`}>Description</Label>
                  <Textarea 
                    id={`subcategory-description-${subcategory.id}`} 
                    value={subcategory.description || ''} 
                    onChange={(e) => updateSubcategory(subcategory.id, 'description', e.target.value)}
                    placeholder="Enter subcategory description"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base">Services</Label>
                    <Button 
                      onClick={() => handleAddJob(subcategory.id)} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Service
                    </Button>
                  </div>

                  {subcategory.jobs?.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded-md">
                      <p className="text-muted-foreground text-sm">No services defined yet.</p>
                    </div>
                  )}
                  
                  {subcategory.jobs?.map((job) => (
                    <Card key={job.id} className="border-0 shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-grow mr-2">
                            <Input 
                              value={job.name} 
                              onChange={(e) => updateJob(subcategory.id, job.id, 'name', e.target.value)}
                              placeholder="Service name"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteJob(subcategory.id, job.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <Textarea 
                          value={job.description || ''} 
                          onChange={(e) => updateJob(subcategory.id, job.id, 'description', e.target.value)}
                          placeholder="Service description"
                          rows={2}
                          className="text-sm"
                        />
                        
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`job-time-${job.id}`} className="text-xs">Estimated Time (minutes)</Label>
                            <Input 
                              id={`job-time-${job.id}`}
                              value={job.estimatedTime || 0} 
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (!isNaN(value) && value >= 0) {
                                  updateJob(subcategory.id, job.id, 'estimatedTime', value);
                                }
                              }}
                              type="number"
                              min={0}
                              className="mt-1"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatTime(job.estimatedTime || 0)}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <Label htmlFor={`job-price-${job.id}`} className="text-xs">Price ($)</Label>
                            <Input 
                              id={`job-price-${job.id}`}
                              value={job.price || 0} 
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (!isNaN(value) && value >= 0) {
                                  updateJob(subcategory.id, job.id, 'price', value);
                                }
                              }}
                              type="number"
                              min={0}
                              step={0.01}
                              className="mt-1"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              ${(job.price || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{editedCategory.name}" category? 
              This action will delete all subcategories and services within it and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(editedCategory.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
