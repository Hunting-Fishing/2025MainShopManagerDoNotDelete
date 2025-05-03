
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { Plus, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';

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
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory | null>(category);
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});

  if (!editedCategory) {
    return (
      <div className="text-center p-10">
        <p className="text-muted-foreground">Please select a category to edit or create a new one.</p>
      </div>
    );
  }

  const handleCategoryChange = (field: keyof ServiceMainCategory, value: string | number) => {
    setEditedCategory(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleSubcategoryChange = (subcategoryId: string, field: keyof ServiceSubcategory, value: string) => {
    setEditedCategory(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        subcategories: prev.subcategories.map(sub => 
          sub.id === subcategoryId ? { ...sub, [field]: value } : sub
        )
      };
    });
  };

  const handleJobChange = (subcategoryId: string, jobId: string, field: keyof ServiceJob, value: string | number) => {
    setEditedCategory(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        subcategories: prev.subcategories.map(sub => 
          sub.id === subcategoryId 
            ? {
                ...sub,
                jobs: sub.jobs.map(job => 
                  job.id === jobId ? { ...job, [field]: value } : job
                )
              } 
            : sub
        )
      };
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
    
    // Automatically expand the new subcategory
    setExpandedSubcategories(prev => ({
      ...prev,
      [newSubcategory.id]: true
    }));
  };

  const addJobToSubcategory = (subcategoryId: string) => {
    if (!editedCategory) return;
    
    const newJob: ServiceJob = {
      id: uuidv4(),
      name: "New Service",
      estimatedTime: 60 // Default to 60 minutes
    };
    
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(sub => 
        sub.id === subcategoryId 
          ? { ...sub, jobs: [...sub.jobs, newJob] }
          : sub
      )
    });
  };

  const removeSubcategory = (id: string) => {
    if (!editedCategory) return;
    
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories.filter(sub => sub.id !== id)
    });
  };

  const removeJob = (subcategoryId: string, jobId: string) => {
    if (!editedCategory) return;
    
    setEditedCategory({
      ...editedCategory,
      subcategories: editedCategory.subcategories.map(sub => 
        sub.id === subcategoryId 
          ? { ...sub, jobs: sub.jobs.filter(job => job.id !== jobId) }
          : sub
      )
    });
  };

  const toggleSubcategoryExpanded = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedCategory) {
      onSave(editedCategory);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Main Category Information</h3>
            <Badge variant="outline" className="px-2 py-1">
              {editedCategory.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} Services
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <Input 
                value={editedCategory.name} 
                onChange={(e) => handleCategoryChange('name', e.target.value)}
                placeholder="Category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <Input 
                type="number" 
                value={editedCategory.position !== undefined ? editedCategory.position : 0} 
                onChange={(e) => handleCategoryChange('position', parseInt(e.target.value))}
                placeholder="Display order position"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea 
              value={editedCategory.description || ''} 
              onChange={(e) => handleCategoryChange('description', e.target.value)}
              placeholder="Category description"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Subcategories & Services</h3>
        <Button type="button" onClick={addSubcategory} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Subcategory
        </Button>
      </div>

      <div className="space-y-4">
        {editedCategory.subcategories.length === 0 ? (
          <Alert>
            <AlertDescription>
              No subcategories yet. Add one to start organizing services.
            </AlertDescription>
          </Alert>
        ) : (
          editedCategory.subcategories.map((subcategory) => (
            <Card key={subcategory.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-8 w-8 mr-2"
                    onClick={() => toggleSubcategoryExpanded(subcategory.id)}
                  >
                    {expandedSubcategories[subcategory.id] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                  
                  <div className="w-full">
                    <Input 
                      value={subcategory.name} 
                      onChange={(e) => handleSubcategoryChange(subcategory.id, 'name', e.target.value)}
                      placeholder="Subcategory name"
                      className="text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="mr-2">
                    {subcategory.jobs.length} services
                  </Badge>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeSubcategory(subcategory.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {expandedSubcategories[subcategory.id] && (
                <CardContent>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium mb-2">Services</h4>
                      <Button 
                        type="button" 
                        onClick={() => addJobToSubcategory(subcategory.id)} 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Service
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {subcategory.jobs.map((job) => (
                        <div key={job.id} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-md">
                          <div className="flex-grow">
                            <Input 
                              value={job.name} 
                              onChange={(e) => handleJobChange(subcategory.id, job.id, 'name', e.target.value)}
                              placeholder="Service name"
                              className="text-sm"
                            />
                          </div>
                          <div className="w-32">
                            <Input 
                              type="number" 
                              value={job.estimatedTime || 0} 
                              onChange={(e) => handleJobChange(subcategory.id, job.id, 'estimatedTime', parseInt(e.target.value))}
                              placeholder="Time (min)"
                              className="text-sm"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-8 w-8"
                            onClick={() => removeJob(subcategory.id, job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {subcategory.jobs.length === 0 && (
                        <div className="text-sm text-muted-foreground italic text-center py-2">
                          No services in this subcategory yet
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <CardFooter className="flex justify-between pt-6 px-0">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </CardFooter>
    </form>
  );
};

export default ServiceCategoryEditor;
