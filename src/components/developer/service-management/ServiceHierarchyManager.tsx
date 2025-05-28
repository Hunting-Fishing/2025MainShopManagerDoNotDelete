
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { 
  fetchServiceCategories, 
  saveServiceCategory, 
  deleteServiceCategory,
  deleteServiceSubcategory,
  deleteServiceJob
} from '@/lib/services/serviceApi';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { toast } from 'sonner';

export function ServiceHierarchyManager() {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<{
    type: 'category' | 'subcategory' | 'job';
    id: string;
    parentId?: string;
    grandParentId?: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchServiceCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load service categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (category: ServiceMainCategory) => {
    try {
      await saveServiceCategory(category);
      await loadCategories();
      toast.success('Category saved successfully');
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      await loadCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    try {
      await deleteServiceSubcategory(categoryId, subcategoryId);
      await loadCategories();
      toast.success('Subcategory deleted successfully');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  const handleDeleteJob = async (categoryId: string, subcategoryId: string, jobId: string) => {
    try {
      await deleteServiceJob(categoryId, subcategoryId, jobId);
      await loadCategories();
      toast.success('Service job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete service job');
    }
  };

  const startEditing = (type: 'category' | 'subcategory' | 'job', id: string, currentValue: string, parentId?: string, grandParentId?: string) => {
    setEditingItem({ type, id, parentId, grandParentId });
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    try {
      const updatedCategories = [...categories];
      
      if (editingItem.type === 'category') {
        const categoryIndex = updatedCategories.findIndex(cat => cat.id === editingItem.id);
        if (categoryIndex !== -1) {
          updatedCategories[categoryIndex] = {
            ...updatedCategories[categoryIndex],
            name: editValue
          };
          await handleSaveCategory(updatedCategories[categoryIndex]);
        }
      } else if (editingItem.type === 'subcategory' && editingItem.parentId) {
        const categoryIndex = updatedCategories.findIndex(cat => cat.id === editingItem.parentId);
        if (categoryIndex !== -1) {
          const subcategoryIndex = updatedCategories[categoryIndex].subcategories.findIndex(sub => sub.id === editingItem.id);
          if (subcategoryIndex !== -1) {
            updatedCategories[categoryIndex].subcategories[subcategoryIndex].name = editValue;
            await handleSaveCategory(updatedCategories[categoryIndex]);
          }
        }
      } else if (editingItem.type === 'job' && editingItem.parentId && editingItem.grandParentId) {
        const categoryIndex = updatedCategories.findIndex(cat => cat.id === editingItem.grandParentId);
        if (categoryIndex !== -1) {
          const subcategoryIndex = updatedCategories[categoryIndex].subcategories.findIndex(sub => sub.id === editingItem.parentId);
          if (subcategoryIndex !== -1) {
            const jobIndex = updatedCategories[categoryIndex].subcategories[subcategoryIndex].jobs.findIndex(job => job.id === editingItem.id);
            if (jobIndex !== -1) {
              updatedCategories[categoryIndex].subcategories[subcategoryIndex].jobs[jobIndex].name = editValue;
              await handleSaveCategory(updatedCategories[categoryIndex]);
            }
          }
        }
      }

      setEditingItem(null);
      setEditValue('');
    } catch (error) {
      console.error('Error saving edit:', error);
      toast.error('Failed to save changes');
    }
  };

  if (loading) {
    return <div className="p-4">Loading service hierarchy...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Hierarchy Manager</h2>
        <Button onClick={() => window.location.reload()}>
          <Plus className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingItem?.type === 'category' && editingItem.id === category.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={saveEdit}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span>{category.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing('category', category.id, category.name)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {category.subcategories?.map((subcategory) => (
              <div key={subcategory.id} className="ml-4 mb-4 border-l-2 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  {editingItem?.type === 'subcategory' && editingItem.id === subcategory.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={saveEdit}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-medium">{subcategory.name}</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing('subcategory', subcategory.id, subcategory.name, category.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                {subcategory.jobs?.map((job) => (
                  <div key={job.id} className="ml-4 flex items-center justify-between py-1">
                    {editingItem?.type === 'job' && editingItem.id === job.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm">{job.name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing('job', job.id, job.name, subcategory.id, category.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteJob(category.id, subcategory.id, job.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
