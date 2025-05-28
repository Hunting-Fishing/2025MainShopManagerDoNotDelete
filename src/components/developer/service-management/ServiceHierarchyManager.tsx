
import React, { useState, useEffect } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Trash2, Edit } from 'lucide-react';
import {
  fetchServiceCategories,
  saveServiceCategory,
  deleteServiceCategory,
  deleteServiceSubcategory,
  deleteServiceJob
} from '@/lib/services/serviceApi';
import { toast } from 'sonner';

interface ServiceHierarchyManagerProps {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  onRefresh: () => void;
}

const ServiceHierarchyManager: React.FC<ServiceHierarchyManagerProps> = ({
  categories,
  isLoading,
  onRefresh
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      toast.success('Service category deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete service category');
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    try {
      await deleteServiceSubcategory(categoryId, subcategoryId);
      toast.success('Service subcategory deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete service subcategory');
    }
  };

  const handleDeleteJob = async (categoryId: string, subcategoryId: string, jobId: string) => {
    try {
      await deleteServiceJob(categoryId, subcategoryId, jobId);
      toast.success('Service job deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete service job');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading service hierarchy...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Service Hierarchy</CardTitle>
          <div className="flex gap-2">
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No service categories found</p>
            <p className="text-sm text-gray-400 mt-2">
              Use the Import/Export tab to add service categories
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg">
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {expandedCategories.has(category.id) ? '▼' : '▶'}
                    </Button>
                    <div>
                      <h3 className="font-medium text-lg">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {expandedCategories.has(category.id) && (
                  <div className="p-4 space-y-3">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="ml-4 border-l-2 border-gray-200 pl-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{subcategory.name}</h4>
                            {subcategory.description && (
                              <p className="text-gray-600 text-sm">{subcategory.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-2 space-y-2">
                          {subcategory.jobs.map((job) => (
                            <div key={job.id} className="ml-4 p-2 bg-gray-50 rounded flex items-center justify-between">
                              <div>
                                <span className="font-medium">{job.name}</span>
                                {job.description && (
                                  <span className="text-gray-600 text-sm ml-2">- {job.description}</span>
                                )}
                                {job.price && (
                                  <span className="text-green-600 ml-2">${job.price}</span>
                                )}
                                {job.estimatedTime && (
                                  <span className="text-blue-600 ml-2">({job.estimatedTime}min)</span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteJob(category.id, subcategory.id, job.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
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
  );
};

export default ServiceHierarchyManager;
