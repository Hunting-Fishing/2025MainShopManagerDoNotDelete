
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { saveServiceCategories, deleteServiceCategory, deleteServiceSubcategory, deleteServiceJob } from '@/lib/services/serviceApi';
import { toast } from 'sonner';

interface ServiceHierarchyManagerProps {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export default function ServiceHierarchyManager({ categories, isLoading, onRefresh }: ServiceHierarchyManagerProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [localCategories, setLocalCategories] = useState<ServiceMainCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategoryExpansion = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  const addNewCategory = () => {
    const newCategory: ServiceMainCategory = {
      id: `temp-cat-${Date.now()}`,
      name: 'New Category',
      description: '',
      subcategories: [],
      position: localCategories.length
    };
    setLocalCategories([...localCategories, newCategory]);
    setEditingCategory(newCategory.id);
    setExpandedCategories(new Set([...expandedCategories, newCategory.id]));
  };

  const addNewSubcategory = (categoryId: string) => {
    const newSubcategory: ServiceSubcategory = {
      id: `temp-sub-${Date.now()}`,
      name: 'New Subcategory',
      description: '',
      jobs: []
    };
    
    setLocalCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
        : cat
    ));
    setEditingSubcategory(newSubcategory.id);
    setExpandedSubcategories(new Set([...expandedSubcategories, newSubcategory.id]));
  };

  const addNewJob = (categoryId: string, subcategoryId: string) => {
    const newJob: ServiceJob = {
      id: `temp-job-${Date.now()}`,
      name: 'New Service',
      description: '',
      price: 0,
      estimatedTime: 60
    };
    
    setLocalCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat, 
            subcategories: cat.subcategories.map(sub => 
              sub.id === subcategoryId 
                ? { ...sub, jobs: [...sub.jobs, newJob] }
                : sub
            )
          }
        : cat
    ));
    setEditingJob(newJob.id);
  };

  const updateCategory = (categoryId: string, field: string, value: string) => {
    setLocalCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    ));
  };

  const updateSubcategory = (categoryId: string, subcategoryId: string, field: string, value: string) => {
    setLocalCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat, 
            subcategories: cat.subcategories.map(sub => 
              sub.id === subcategoryId ? { ...sub, [field]: value } : sub
            )
          }
        : cat
    ));
  };

  const updateJob = (categoryId: string, subcategoryId: string, jobId: string, field: string, value: string | number) => {
    setLocalCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat, 
            subcategories: cat.subcategories.map(sub => 
              sub.id === subcategoryId 
                ? {
                    ...sub, 
                    jobs: sub.jobs.map(job => 
                      job.id === jobId ? { ...job, [field]: value } : job
                    )
                  }
                : sub
            )
          }
        : cat
    ));
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      setLocalCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const deleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    try {
      await deleteServiceSubcategory(subcategoryId);
      setLocalCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId) }
          : cat
      ));
      toast.success('Subcategory deleted successfully');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  const deleteJob = async (categoryId: string, subcategoryId: string, jobId: string) => {
    try {
      await deleteServiceJob(jobId);
      setLocalCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? {
              ...cat, 
              subcategories: cat.subcategories.map(sub => 
                sub.id === subcategoryId 
                  ? { ...sub, jobs: sub.jobs.filter(job => job.id !== jobId) }
                  : sub
              )
            }
          : cat
      ));
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const saveChanges = async () => {
    try {
      setIsSaving(true);
      await saveServiceCategories(localCategories);
      await onRefresh();
      setEditingCategory(null);
      setEditingSubcategory(null);
      setEditingJob(null);
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading service categories...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Service Categories</CardTitle>
        <div className="flex gap-2">
          <Button onClick={addNewCategory} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={saveChanges} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {localCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No service categories found. Add your first category to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {localCategories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryExpansion(category.id)}
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    {editingCategory === category.id ? (
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                        className="font-semibold"
                        autoFocus
                      />
                    ) : (
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCategory(editingCategory === category.id ? null : category.id)}
                    >
                      {editingCategory === category.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addNewSubcategory(category.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {editingCategory === category.id && (
                  <Textarea
                    value={category.description || ''}
                    onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                    placeholder="Category description..."
                    className="mb-2"
                  />
                )}

                {expandedCategories.has(category.id) && (
                  <div className="ml-6 space-y-3">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="border rounded-md p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSubcategoryExpansion(subcategory.id)}
                            >
                              {expandedSubcategories.has(subcategory.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            {editingSubcategory === subcategory.id ? (
                              <Input
                                value={subcategory.name}
                                onChange={(e) => updateSubcategory(category.id, subcategory.id, 'name', e.target.value)}
                                className="font-medium"
                                autoFocus
                              />
                            ) : (
                              <h4 className="font-medium">{subcategory.name}</h4>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSubcategory(editingSubcategory === subcategory.id ? null : subcategory.id)}
                            >
                              {editingSubcategory === subcategory.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addNewJob(category.id, subcategory.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteSubcategory(category.id, subcategory.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {editingSubcategory === subcategory.id && (
                          <Textarea
                            value={subcategory.description || ''}
                            onChange={(e) => updateSubcategory(category.id, subcategory.id, 'description', e.target.value)}
                            placeholder="Subcategory description..."
                            className="mb-2"
                          />
                        )}

                        {expandedSubcategories.has(subcategory.id) && (
                          <div className="ml-6 space-y-2">
                            {subcategory.jobs.map((job) => (
                              <div key={job.id} className="border rounded-sm p-2 bg-white">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    {editingJob === job.id ? (
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          value={job.name}
                                          onChange={(e) => updateJob(category.id, subcategory.id, job.id, 'name', e.target.value)}
                                          placeholder="Service name"
                                        />
                                        <Input
                                          type="number"
                                          value={job.price || 0}
                                          onChange={(e) => updateJob(category.id, subcategory.id, job.id, 'price', parseFloat(e.target.value))}
                                          placeholder="Price"
                                        />
                                        <Input
                                          type="number"
                                          value={job.estimatedTime || 0}
                                          onChange={(e) => updateJob(category.id, subcategory.id, job.id, 'estimatedTime', parseInt(e.target.value))}
                                          placeholder="Time (minutes)"
                                        />
                                        <Textarea
                                          value={job.description || ''}
                                          onChange={(e) => updateJob(category.id, subcategory.id, job.id, 'description', e.target.value)}
                                          placeholder="Description"
                                          className="col-span-2"
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        <span className="font-medium">{job.name}</span>
                                        {job.price && <span className="ml-2 text-green-600">${job.price}</span>}
                                        {job.estimatedTime && <span className="ml-2 text-blue-600">{job.estimatedTime}min</span>}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingJob(editingJob === job.id ? null : job.id)}
                                    >
                                      {editingJob === job.id ? <X className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteJob(category.id, subcategory.id, job.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
