
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { Plus, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from "@/lib/utils";

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
  const [editingCategory, setEditingCategory] = useState<ServiceMainCategory>(() => {
    if (category) {
      return { ...category };
    }
    
    return {
      id: uuidv4(),
      name: '',
      description: '',
      subcategories: []
    };
  });
  
  const [editingSubcategory, setEditingSubcategory] = useState<ServiceSubcategory | null>(null);
  const [editingJob, setEditingJob] = useState<{
    job: ServiceJob;
    subcategoryId: string;
  } | null>(null);

  // Update local state when the category prop changes
  useEffect(() => {
    if (category) {
      setEditingCategory({ ...category });
    } else {
      setEditingCategory({
        id: uuidv4(),
        name: '',
        description: '',
        subcategories: []
      });
    }
    
    // Reset editing states
    setEditingSubcategory(null);
    setEditingJob(null);
  }, [category]);

  // Handle adding a new subcategory
  const handleAddSubcategory = () => {
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: '',
      description: '',
      jobs: []
    };
    
    setEditingCategory({
      ...editingCategory,
      subcategories: [...editingCategory.subcategories, newSubcategory]
    });
    
    setEditingSubcategory(newSubcategory);
  };

  // Handle editing a subcategory
  const handleEditSubcategory = (subcategory: ServiceSubcategory) => {
    setEditingSubcategory({ ...subcategory });
  };

  // Handle saving subcategory changes
  const handleSaveSubcategory = (updatedSubcategory: ServiceSubcategory) => {
    setEditingCategory({
      ...editingCategory,
      subcategories: editingCategory.subcategories.map(sub =>
        sub.id === updatedSubcategory.id ? updatedSubcategory : sub
      )
    });
    
    setEditingSubcategory(null);
  };

  // Handle deleting a subcategory
  const handleDeleteSubcategory = (subcategoryId: string) => {
    setEditingCategory({
      ...editingCategory,
      subcategories: editingCategory.subcategories.filter(sub => sub.id !== subcategoryId)
    });
    
    if (editingSubcategory?.id === subcategoryId) {
      setEditingSubcategory(null);
    }
  };

  // Handle adding a job to a subcategory
  const handleAddJob = (subcategoryId: string) => {
    const newJob: ServiceJob = {
      id: uuidv4(),
      name: '',
      description: '',
      estimatedTime: 0
    };
    
    setEditingJob({
      job: newJob,
      subcategoryId
    });
  };

  // Handle editing a job
  const handleEditJob = (job: ServiceJob, subcategoryId: string) => {
    setEditingJob({
      job: { ...job },
      subcategoryId
    });
  };

  // Handle saving job changes
  const handleSaveJob = () => {
    if (!editingJob) return;
    
    const { job, subcategoryId } = editingJob;
    
    setEditingCategory({
      ...editingCategory,
      subcategories: editingCategory.subcategories.map(sub => {
        if (sub.id !== subcategoryId) return sub;
        
        // Check if we're updating or adding a new job
        const existingJobIndex = sub.jobs.findIndex(j => j.id === job.id);
        
        if (existingJobIndex >= 0) {
          // Update existing job
          const updatedJobs = [...sub.jobs];
          updatedJobs[existingJobIndex] = job;
          return { ...sub, jobs: updatedJobs };
        } else {
          // Add new job
          return { ...sub, jobs: [...sub.jobs, job] };
        }
      })
    });
    
    setEditingJob(null);
  };

  // Handle deleting a job
  const handleDeleteJob = (jobId: string, subcategoryId: string) => {
    setEditingCategory({
      ...editingCategory,
      subcategories: editingCategory.subcategories.map(sub => {
        if (sub.id !== subcategoryId) return sub;
        return { ...sub, jobs: sub.jobs.filter(job => job.id !== jobId) };
      })
    });
    
    if (editingJob?.job.id === jobId) {
      setEditingJob(null);
    }
  };

  // Handle reordering via drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    
    if (type === 'subcategory') {
      const reorderedSubcategories = Array.from(editingCategory.subcategories);
      const [removed] = reorderedSubcategories.splice(source.index, 1);
      reorderedSubcategories.splice(destination.index, 0, removed);
      
      setEditingCategory({
        ...editingCategory,
        subcategories: reorderedSubcategories
      });
    } else if (type === 'job') {
      // Extract subcategory ID from the droppable ID
      const subcategoryId = source.droppableId.replace('jobs-', '');
      const subcategory = editingCategory.subcategories.find(sub => sub.id === subcategoryId);
      
      if (subcategory) {
        const reorderedJobs = Array.from(subcategory.jobs);
        const [removed] = reorderedJobs.splice(source.index, 1);
        reorderedJobs.splice(destination.index, 0, removed);
        
        setEditingCategory({
          ...editingCategory,
          subcategories: editingCategory.subcategories.map(sub => 
            sub.id === subcategoryId ? { ...sub, jobs: reorderedJobs } : sub
          )
        });
      }
    }
  };

  // Handle saving the entire category
  const handleSaveCategory = () => {
    onSave(editingCategory);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
      <div className="col-span-1 md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({
                  ...editingCategory,
                  name: e.target.value
                })}
                placeholder="Enter category name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={editingCategory.description || ''}
                onChange={(e) => setEditingCategory({
                  ...editingCategory,
                  description: e.target.value
                })}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            
            <div className="pt-4">
              <Label className="mb-2 block">Subcategories</Label>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="subcategories" type="subcategory">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {editingCategory.subcategories.map((subcategory, index) => (
                        <Draggable
                          key={subcategory.id}
                          draggableId={subcategory.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "flex items-center justify-between p-3 border rounded-md",
                                snapshot.isDragging ? "bg-blue-50" : "bg-white",
                                editingSubcategory?.id === subcategory.id && "border-blue-500"
                              )}
                            >
                              <div>
                                <div className="font-medium">{subcategory.name || "Unnamed Subcategory"}</div>
                                <div className="text-xs text-muted-foreground">
                                  {subcategory.jobs.length} jobs
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditSubcategory(subcategory)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteSubcategory(subcategory.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={handleAddSubcategory}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Subcategory
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button onClick={handleSaveCategory} disabled={!editingCategory.name}>
              <Save className="h-4 w-4 mr-2" /> Save Category
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="col-span-1 md:col-span-4">
        {editingSubcategory ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Subcategory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="subcategoryName">Subcategory Name</Label>
                <Input
                  id="subcategoryName"
                  value={editingSubcategory.name}
                  onChange={(e) => setEditingSubcategory({
                    ...editingSubcategory,
                    name: e.target.value
                  })}
                  placeholder="Enter subcategory name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="subcategoryDescription">Description</Label>
                <Textarea
                  id="subcategoryDescription"
                  value={editingSubcategory.description || ''}
                  onChange={(e) => setEditingSubcategory({
                    ...editingSubcategory,
                    description: e.target.value
                  })}
                  placeholder="Enter subcategory description"
                  rows={2}
                />
              </div>
              
              <div className="pt-4">
                <Label className="mb-2 flex justify-between items-center">
                  <span>Jobs</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddJob(editingSubcategory.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Job
                  </Button>
                </Label>
                
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId={`jobs-${editingSubcategory.id}`} type="job">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {editingSubcategory.jobs.map((job, index) => (
                          <Draggable
                            key={job.id}
                            draggableId={job.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "flex items-center justify-between p-3 border rounded-md",
                                  snapshot.isDragging ? "bg-blue-50" : "bg-white",
                                  editingJob?.job.id === job.id && "border-blue-500"
                                )}
                              >
                                <div>
                                  <div className="font-medium">{job.name || "Unnamed Job"}</div>
                                  {job.estimatedTime && (
                                    <div className="text-xs text-muted-foreground">
                                      Est. time: {Math.floor(job.estimatedTime / 60)}h {job.estimatedTime % 60}m
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditJob(job, editingSubcategory.id)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteJob(job.id, editingSubcategory.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                {editingSubcategory.jobs.length === 0 && (
                  <div className="text-center py-6 border rounded-md border-dashed text-muted-foreground">
                    No jobs added yet
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setEditingSubcategory(null)}>
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button 
                onClick={() => handleSaveSubcategory(editingSubcategory)}
                disabled={!editingSubcategory.name}
              >
                <Save className="h-4 w-4 mr-2" /> Save Subcategory
              </Button>
            </CardFooter>
          </Card>
        ) : editingJob ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingJob.job.id ? 'Edit Job' : 'Add Job'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="jobName">Job Name</Label>
                <Input
                  id="jobName"
                  value={editingJob.job.name}
                  onChange={(e) => setEditingJob({
                    ...editingJob,
                    job: { ...editingJob.job, name: e.target.value }
                  })}
                  placeholder="Enter job name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="jobDescription">Description</Label>
                <Textarea
                  id="jobDescription"
                  value={editingJob.job.description || ''}
                  onChange={(e) => setEditingJob({
                    ...editingJob,
                    job: { ...editingJob.job, description: e.target.value }
                  })}
                  placeholder="Enter job description"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={editingJob.job.estimatedTime || ''}
                    onChange={(e) => setEditingJob({
                      ...editingJob,
                      job: { 
                        ...editingJob.job, 
                        estimatedTime: e.target.value ? parseInt(e.target.value) : undefined 
                      }
                    })}
                    placeholder="Enter estimated time in minutes"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="jobPrice">Price (optional)</Label>
                  <Input
                    id="jobPrice"
                    type="number"
                    step="0.01"
                    value={editingJob.job.price || ''}
                    onChange={(e) => setEditingJob({
                      ...editingJob,
                      job: { 
                        ...editingJob.job, 
                        price: e.target.value ? parseFloat(e.target.value) : undefined 
                      }
                    })}
                    placeholder="Enter job price"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setEditingJob(null)}>
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button 
                onClick={handleSaveJob}
                disabled={!editingJob.job.name}
              >
                <Save className="h-4 w-4 mr-2" /> Save Job
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed rounded-lg p-10">
            <div className="text-center text-muted-foreground">
              <h3 className="mb-2 font-medium">Edit Services</h3>
              <p>Select or add a subcategory to manage its jobs</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
