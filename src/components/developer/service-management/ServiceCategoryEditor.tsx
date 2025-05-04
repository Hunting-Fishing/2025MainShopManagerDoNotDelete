
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { Plus, Trash2, GripVertical, Save, X, ArrowLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

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
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory | null>(null);

  // Initialize form with category data
  useEffect(() => {
    if (category) {
      setEditedCategory({...category});
    } else {
      setEditedCategory(null);
    }
  }, [category]);

  if (!editedCategory) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Select a category to edit or create a new one</p>
      </div>
    );
  }

  const handleCategoryChange = (field: keyof ServiceMainCategory, value: string) => {
    setEditedCategory(prev => 
      prev ? {...prev, [field]: value} : null
    );
  };

  const handleSubcategoryChange = (index: number, field: keyof ServiceSubcategory, value: string) => {
    if (!editedCategory) return;

    const updatedSubcategories = [...editedCategory.subcategories];
    updatedSubcategories[index] = {
      ...updatedSubcategories[index],
      [field]: value
    };

    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleJobChange = (subIndex: number, jobIndex: number, field: keyof ServiceJob, value: any) => {
    if (!editedCategory) return;

    const updatedSubcategories = [...editedCategory.subcategories];
    const jobs = [...updatedSubcategories[subIndex].jobs];
    
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      [field]: field === 'price' || field === 'estimatedTime' ? Number(value) : value
    };
    
    updatedSubcategories[subIndex] = {
      ...updatedSubcategories[subIndex],
      jobs
    };

    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });
  };

  const addSubcategory = () => {
    if (!editedCategory) return;
    
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: "New Subcategory",
      jobs: []
    };
    
    setEditedCategory({
      ...editedCategory,
      subcategories: [...editedCategory.subcategories, newSubcategory]
    });

    toast({
      title: "Subcategory added",
      description: "New subcategory has been added to the category.",
    });
  };

  const removeSubcategory = (index: number) => {
    if (!editedCategory) return;
    
    const updatedSubcategories = [...editedCategory.subcategories];
    updatedSubcategories.splice(index, 1);
    
    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });

    toast({
      title: "Subcategory removed",
      description: "Subcategory has been removed from the category.",
    });
  };

  const addJob = (subIndex: number) => {
    if (!editedCategory) return;
    
    const updatedSubcategories = [...editedCategory.subcategories];
    const jobs = [...updatedSubcategories[subIndex].jobs];
    
    jobs.push({
      id: uuidv4(),
      name: "New Service Job",
      estimatedTime: 30,
      price: 0
    });
    
    updatedSubcategories[subIndex] = {
      ...updatedSubcategories[subIndex],
      jobs
    };
    
    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });
  };

  const removeJob = (subIndex: number, jobIndex: number) => {
    if (!editedCategory) return;
    
    const updatedSubcategories = [...editedCategory.subcategories];
    const jobs = [...updatedSubcategories[subIndex].jobs];
    
    jobs.splice(jobIndex, 1);
    
    updatedSubcategories[subIndex] = {
      ...updatedSubcategories[subIndex],
      jobs
    };
    
    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });
  };

  const handleSave = () => {
    if (editedCategory) {
      onSave(editedCategory);
    }
  };

  // Helper function to get time unit label
  const getTimeLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-xl font-semibold grow">{category.id ? 'Edit' : 'Create'} Service Category</h2>
      </div>

      <Card className="border-l-4 border-l-esm-blue-500">
        <CardHeader className="bg-gradient-to-r from-esm-blue-50 to-transparent">
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category Name</label>
              <Input
                value={editedCategory.name}
                onChange={(e) => handleCategoryChange('name', e.target.value)}
                placeholder="Category Name"
                className="mb-4"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Position</label>
              <Input
                type="number"
                value={editedCategory.position !== undefined ? editedCategory.position : ''}
                onChange={(e) => handleCategoryChange('position', e.target.value)}
                placeholder="Display Order"
                className="mb-4"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={editedCategory.description || ''}
              onChange={(e) => handleCategoryChange('description', e.target.value)}
              placeholder="Category description..."
              className="mb-4"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent">
          <div className="flex justify-between items-center">
            <CardTitle>Subcategories & Services</CardTitle>
            <Button 
              onClick={addSubcategory} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Subcategory
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {editedCategory.subcategories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg bg-muted/30">
                  <p className="text-muted-foreground mb-2">No subcategories defined yet</p>
                  <Button 
                    onClick={addSubcategory} 
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Subcategory
                  </Button>
                </div>
              )}

              {editedCategory.subcategories.map((subcategory, index) => (
                <Card key={subcategory.id} className={cn(
                  "border-l-4 transition-all",
                  subcategory.jobs.length > 0 ? "border-l-green-500" : "border-l-amber-400"
                )}>
                  <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-transparent">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move opacity-50" />
                        <div className="space-y-1">
                          <Input
                            value={subcategory.name}
                            onChange={(e) => handleSubcategoryChange(index, 'name', e.target.value)}
                            placeholder="Subcategory Name"
                            className="font-medium border-none bg-transparent p-0 h-auto text-base focus-visible:ring-transparent shadow-none"
                          />
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-muted">
                              {subcategory.jobs.length} services
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeSubcategory(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="grid grid-cols-12 gap-2 px-2 py-1 bg-muted rounded text-xs font-medium">
                        <div className="col-span-5">Service Name</div>
                        <div className="col-span-3">Est. Time</div>
                        <div className="col-span-3">Price</div>
                        <div className="col-span-1"></div>
                      </div>
                      
                      {subcategory.jobs.map((job, jobIndex) => (
                        <div key={job.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-card border rounded-md">
                          <div className="col-span-5">
                            <Input
                              value={job.name}
                              onChange={(e) => handleJobChange(index, jobIndex, 'name', e.target.value)}
                              placeholder="Job name"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              value={job.estimatedTime || ''}
                              onChange={(e) => handleJobChange(index, jobIndex, 'estimatedTime', e.target.value)}
                              placeholder="Minutes"
                              className="h-8 text-sm"
                            />
                            {job.estimatedTime && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {getTimeLabel(job.estimatedTime)}
                              </div>
                            )}
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              value={job.price || ''}
                              onChange={(e) => handleJobChange(index, jobIndex, 'price', e.target.value)}
                              placeholder="0.00"
                              className="h-8 text-sm"
                            />
                            {job.price > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatCurrency(job.price)}
                              </div>
                            )}
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeJob(index, jobIndex)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => addJob(index)}
                      variant="outline"
                      size="sm"
                      className="w-full bg-muted/50 hover:bg-muted flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          disabled={!editedCategory.name || !editedCategory.name.trim()}
          className="gap-2 bg-esm-blue-600"
        >
          <Save className="h-4 w-4" /> Save Category
        </Button>
      </div>
    </div>
  );
};

export default ServiceCategoryEditor;
