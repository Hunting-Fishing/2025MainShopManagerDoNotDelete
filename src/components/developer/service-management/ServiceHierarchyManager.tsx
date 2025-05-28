
import React, { useState } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import {
  updateServiceCategory,
  deleteServiceCategory,
  deleteServiceSubcategory,
  deleteServiceJob
} from '@/lib/services/serviceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceHierarchyManagerProps {
  categories: ServiceMainCategory[];
  onCategoriesUpdated: () => void;
}

export const ServiceHierarchyManager: React.FC<ServiceHierarchyManagerProps> = ({
  categories,
  onCategoriesUpdated
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  const handleEditCategory = (category: ServiceMainCategory) => {
    setEditingCategory(category.id);
    setEditValues({
      name: category.name,
      description: category.description || ''
    });
  };

  const handleSaveCategory = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      const updatedCategory = {
        ...category,
        name: editValues.name,
        description: editValues.description
      };

      await updateServiceCategory(updatedCategory);
      setEditingCategory(null);
      setEditValues({});
      onCategoriesUpdated();
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteServiceCategory(categoryId);
      onCategoriesUpdated();
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      await deleteServiceSubcategory(categoryId, subcategoryId);
      onCategoriesUpdated();
      toast.success('Subcategory deleted successfully');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  const handleDeleteJob = async (categoryId: string, subcategoryId: string, jobId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await deleteServiceJob(categoryId, subcategoryId, jobId);
      onCategoriesUpdated();
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <Card key={category.id} className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <div className="flex items-center justify-between">
              {editingCategory === category.id ? (
                <div className="flex-1 space-y-2">
                  <Input
                    value={editValues.name || ''}
                    onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                    placeholder="Category name"
                  />
                  <Textarea
                    value={editValues.description || ''}
                    onChange={(e) => setEditValues({...editValues, description: e.target.value})}
                    placeholder="Category description"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveCategory(category.id)}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <CardTitle className="text-lg text-indigo-700">{category.name}</CardTitle>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.subcategories.map(subcategory => (
                <Card key={subcategory.id} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-md text-blue-600">{subcategory.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {subcategory.description && (
                      <p className="text-xs text-gray-500">{subcategory.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {subcategory.jobs.map(job => (
                        <div key={job.id} className="p-2 bg-gray-50 rounded border flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">{job.name}</div>
                            {job.description && (
                              <div className="text-xs text-gray-500">{job.description}</div>
                            )}
                            <div className="text-xs text-gray-600 mt-1">
                              {job.price && <span className="mr-2">${job.price}</span>}
                              {job.estimatedTime && <span>{job.estimatedTime} min</span>}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteJob(category.id, subcategory.id, job.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
