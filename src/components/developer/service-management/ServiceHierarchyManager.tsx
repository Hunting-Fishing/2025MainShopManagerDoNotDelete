import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceMainCategory } from '@/types/service';
import { ServiceCategoriesManager } from './ServiceCategoriesManager';
import { ServiceEditor } from './ServiceEditor';
import { ServiceDebugInfo } from './ServiceDebugInfo';
import { ServiceAnalytics } from './ServiceAnalytics';
import { ServiceDuplicatesManager } from './ServiceDuplicatesManager';
import { fetchServiceCategories } from '@/lib/services/serviceApi';

interface ServiceHierarchyManagerProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

const ServiceHierarchyManager: React.FC<ServiceHierarchyManagerProps> = ({
  categories,
  onRefresh
}) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all subcategories and jobs.')) {
      return;
    }

    setIsDeleting(categoryId);
    try {
      await deleteServiceCategory(categoryId);
      toast.success('Category deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory? This will also delete all jobs.')) {
      return;
    }

    setIsDeleting(subcategoryId);
    try {
      await deleteServiceSubcategory(subcategoryId);
      toast.success('Subcategory deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    setIsDeleting(jobId);
    try {
      await deleteServiceJob(jobId);
      toast.success('Job deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    } finally {
      setIsDeleting(null);
    }
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">No service categories found</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={isDeleting === category.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </CardHeader>
          <CardContent>
            {category.subcategories.length === 0 ? (
              <p className="text-gray-500 text-sm">No subcategories</p>
            ) : (
              <div className="space-y-3">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{subcategory.name}</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          disabled={isDeleting === subcategory.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {subcategory.description && (
                      <p className="text-sm text-gray-600 mb-2">{subcategory.description}</p>
                    )}
                    {subcategory.jobs.length === 0 ? (
                      <p className="text-gray-500 text-xs">No jobs</p>
                    ) : (
                      <div className="space-y-2">
                        {subcategory.jobs.map((job) => (
                          <div key={job.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div>
                              <span className="text-sm font-medium">{job.name}</span>
                              {job.price && (
                                <span className="text-sm text-gray-600 ml-2">${job.price}</span>
                              )}
                              {job.estimatedTime && (
                                <span className="text-sm text-gray-600 ml-2">({job.estimatedTime}min)</span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteJob(job.id)}
                                disabled={isDeleting === job.id}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
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
      ))}
    </div>
  );
};

export default ServiceHierarchyManager;
