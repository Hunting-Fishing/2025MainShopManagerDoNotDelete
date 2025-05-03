
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { AlertCircle, Plus, Save, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    subcategories: []
  });
  const [activeSubcategoryIndex, setActiveSubcategoryIndex] = useState<number | null>(null);
  const [activeJobIndex, setActiveJobIndex] = useState<number | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<ServiceSubcategory | null>(null);

  useEffect(() => {
    if (category) {
      setEditedCategory({ ...category });
      if (category.subcategories.length > 0) {
        setActiveSubcategoryIndex(0);
        setActiveSubcategory(category.subcategories[0]);
      }
    } else {
      setEditedCategory({
        id: uuidv4(),
        name: '',
        description: '',
        subcategories: []
      });
      setActiveSubcategoryIndex(null);
      setActiveSubcategory(null);
    }
    setActiveJobIndex(null);
  }, [category]);

  const handleAddSubcategory = () => {
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: `New Subcategory ${editedCategory.subcategories.length + 1}`,
      description: '',
      jobs: []
    };
    
    const updatedCategory = {
      ...editedCategory,
      subcategories: [...editedCategory.subcategories, newSubcategory]
    };
    
    setEditedCategory(updatedCategory);
    setActiveSubcategoryIndex(updatedCategory.subcategories.length - 1);
    setActiveSubcategory(newSubcategory);
    setActiveJobIndex(null);
  };

  const handleAddJob = () => {
    if (activeSubcategoryIndex === null) return;

    const newJob: ServiceJob = {
      id: uuidv4(),
      name: `New Job ${activeSubcategory?.jobs.length || 0 + 1}`,
      description: '',
      estimatedTime: 60,
      price: 0
    };
    
    const updatedSubcategories = [...editedCategory.subcategories];
    updatedSubcategories[activeSubcategoryIndex].jobs.push(newJob);
    
    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });
    
    setActiveJobIndex(activeSubcategory ? activeSubcategory.jobs.length : 0);
    setActiveSubcategory(updatedSubcategories[activeSubcategoryIndex]);
  };

  const handleDeleteSubcategory = (index: number) => {
    const updatedSubcategories = [...editedCategory.subcategories];
    updatedSubcategories.splice(index, 1);
    
    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });
    
    if (updatedSubcategories.length > 0) {
      const newActiveIndex = Math.min(index, updatedSubcategories.length - 1);
      setActiveSubcategoryIndex(newActiveIndex);
      setActiveSubcategory(updatedSubcategories[newActiveIndex]);
    } else {
      setActiveSubcategoryIndex(null);
      setActiveSubcategory(null);
    }
    setActiveJobIndex(null);
  };

  const handleDeleteJob = (subIndex: number, jobIndex: number) => {
    const updatedSubcategories = [...editedCategory.subcategories];
    updatedSubcategories[subIndex].jobs.splice(jobIndex, 1);
    
    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });
    
    if (activeSubcategoryIndex === subIndex) {
      if (updatedSubcategories[subIndex].jobs.length > 0) {
        const newActiveJobIndex = Math.min(jobIndex, updatedSubcategories[subIndex].jobs.length - 1);
        setActiveJobIndex(newActiveJobIndex);
      } else {
        setActiveJobIndex(null);
      }
      setActiveSubcategory(updatedSubcategories[subIndex]);
    }
  };

  const handleUpdateCategory = (field: string, value: string) => {
    setEditedCategory({
      ...editedCategory,
      [field]: value
    });
  };

  const handleUpdateSubcategory = (index: number, field: string, value: string) => {
    const updatedSubcategories = [...editedCategory.subcategories];
    updatedSubcategories[index] = {
      ...updatedSubcategories[index],
      [field]: value
    };
    
    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });
    
    if (activeSubcategoryIndex === index) {
      setActiveSubcategory(updatedSubcategories[index]);
    }
  };

  const handleUpdateJob = (subIndex: number, jobIndex: number, field: string, value: any) => {
    const updatedSubcategories = [...editedCategory.subcategories];
    updatedSubcategories[subIndex].jobs[jobIndex] = {
      ...updatedSubcategories[subIndex].jobs[jobIndex],
      [field]: field === 'estimatedTime' || field === 'price' ? Number(value) : value
    };
    
    setEditedCategory({
      ...editedCategory,
      subcategories: updatedSubcategories
    });
    
    if (activeSubcategoryIndex === subIndex) {
      setActiveSubcategory(updatedSubcategories[subIndex]);
    }
  };

  const handleSubmit = () => {
    onSave(editedCategory);
  };

  const isValid = () => {
    return editedCategory.name.trim() !== '' && 
           editedCategory.subcategories.every(sub => sub.name.trim() !== '' && 
           sub.jobs.every(job => job.name.trim() !== ''));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {category ? `Edit Category: ${category.name}` : 'Create New Category'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            variant="default" 
            onClick={handleSubmit} 
            disabled={!isValid()}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> Save Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name</Label>
                <Input 
                  id="categoryName"
                  value={editedCategory.name} 
                  onChange={(e) => handleUpdateCategory('name', e.target.value)}
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={editedCategory.description || ''} 
                  onChange={(e) => handleUpdateCategory('description', e.target.value)}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Subcategories
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-2 bg-green-100 text-green-800 hover:bg-green-200"
                    onClick={handleAddSubcategory}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {editedCategory.subcategories.map((subcategory, index) => (
                    <div 
                      key={subcategory.id}
                      className={`p-3 rounded border cursor-pointer ${
                        index === activeSubcategoryIndex 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setActiveSubcategoryIndex(index);
                        setActiveSubcategory(subcategory);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{subcategory.name}</div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubcategory(index);
                          }}
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {subcategory.jobs.length} jobs
                      </div>
                    </div>
                  ))}
                  
                  {editedCategory.subcategories.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No subcategories added yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          {activeSubcategoryIndex !== null && activeSubcategory ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Subcategory: {activeSubcategory.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Subcategory Details</TabsTrigger>
                    <TabsTrigger value="jobs">Jobs ({activeSubcategory.jobs.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="subcategoryName">Subcategory Name</Label>
                      <Input 
                        id="subcategoryName"
                        value={activeSubcategory.name} 
                        onChange={(e) => handleUpdateSubcategory(activeSubcategoryIndex, 'name', e.target.value)}
                        placeholder="Enter subcategory name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="subcategoryDescription">Description</Label>
                      <Textarea
                        id="subcategoryDescription"
                        value={activeSubcategory.description || ''} 
                        onChange={(e) => handleUpdateSubcategory(activeSubcategoryIndex, 'description', e.target.value)}
                        placeholder="Enter subcategory description"
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="jobs">
                    <div className="pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Jobs</h3>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-green-100 text-green-800 hover:bg-green-200"
                          onClick={handleAddJob}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Job
                        </Button>
                      </div>
                      
                      {activeSubcategory.jobs.length > 0 ? (
                        <div className="space-y-6">
                          {activeSubcategory.jobs.map((job, jobIndex) => (
                            <Card key={job.id} className={jobIndex === activeJobIndex ? 'border-blue-500' : ''}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                  <CardTitle className="text-base">{job.name}</CardTitle>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleDeleteJob(activeSubcategoryIndex, jobIndex)}
                                    className="h-8 w-8 p-0 text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-4 space-y-3">
                                <div>
                                  <Label htmlFor={`job-${jobIndex}-name`}>Job Name</Label>
                                  <Input 
                                    id={`job-${jobIndex}-name`}
                                    value={job.name} 
                                    onChange={(e) => handleUpdateJob(activeSubcategoryIndex, jobIndex, 'name', e.target.value)}
                                    placeholder="Enter job name"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor={`job-${jobIndex}-desc`}>Description</Label>
                                  <Input 
                                    id={`job-${jobIndex}-desc`}
                                    value={job.description || ''} 
                                    onChange={(e) => handleUpdateJob(activeSubcategoryIndex, jobIndex, 'description', e.target.value)}
                                    placeholder="Enter job description"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`job-${jobIndex}-time`}>Estimated Time (minutes)</Label>
                                    <Input 
                                      id={`job-${jobIndex}-time`}
                                      type="number" 
                                      value={job.estimatedTime || 0} 
                                      onChange={(e) => handleUpdateJob(activeSubcategoryIndex, jobIndex, 'estimatedTime', e.target.value)}
                                      placeholder="Time in minutes"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`job-${jobIndex}-price`}>Price</Label>
                                    <Input 
                                      id={`job-${jobIndex}-price`}
                                      type="number" 
                                      value={job.price || 0} 
                                      onChange={(e) => handleUpdateJob(activeSubcategoryIndex, jobIndex, 'price', e.target.value)}
                                      placeholder="Price"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border rounded-lg">
                          <p className="text-muted-foreground">No jobs added to this subcategory yet</p>
                          <Button 
                            className="mt-4" 
                            variant="outline"
                            onClick={handleAddJob}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add First Job
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-16">
                <p className="text-muted-foreground mb-4">
                  {editedCategory.subcategories.length > 0 
                    ? 'Select a subcategory from the list to edit' 
                    : 'Add a subcategory to get started'}
                </p>
                {editedCategory.subcategories.length === 0 && (
                  <Button 
                    variant="outline"
                    onClick={handleAddSubcategory}
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add First Subcategory
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
