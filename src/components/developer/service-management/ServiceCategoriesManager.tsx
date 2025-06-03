
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Edit, 
  Copy,
  Plus
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { deleteServiceCategory, deleteServiceSubcategory, deleteServiceJob } from '@/lib/services/serviceApi';
import { toast } from '@/hooks/use-toast';

interface ServiceCategoriesManagerProps {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  onRefresh: () => void;
}

const ServiceCategoriesManager: React.FC<ServiceCategoriesManagerProps> = ({
  categories,
  isLoading,
  onRefresh
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    category: ServiceMainCategory | null;
  }>({ isOpen: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  const handleDeleteCategory = (category: ServiceMainCategory) => {
    setDeleteDialog({ isOpen: true, category });
  };

  const confirmDeleteCategory = async (categoryId: string) => {
    setIsDeleting(true);
    try {
      await deleteServiceCategory(categoryId);
      toast({
        title: "Category Deleted",
        description: "Service category has been successfully deleted.",
        variant: "default",
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: "Delete Failed", 
        description: "Failed to delete service category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string, subcategoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${subcategoryName}" subcategory? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteServiceSubcategory(subcategoryId);
      toast({
        title: "Subcategory Deleted",
        description: "Service subcategory has been successfully deleted.",
        variant: "default",
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to delete subcategory:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete service subcategory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: string, jobName: string) => {
    if (!confirm(`Are you sure you want to delete "${jobName}" job? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteServiceJob(jobId);
      toast({
        title: "Job Deleted",
        description: "Service job has been successfully deleted.",
        variant: "default",
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete service job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: ServiceMainCategory) => {
    toast({
      title: "Feature Coming Soon",
      description: "Edit functionality will be available in a future update.",
      variant: "default",
    });
  };

  const handleDuplicateCategory = (category: ServiceMainCategory) => {
    toast({
      title: "Feature Coming Soon", 
      description: "Duplicate functionality will be available in a future update.",
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Loading service categories...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Categories</CardTitle>
            <Button onClick={onRefresh} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <Collapsible
                key={category.id}
                open={expandedCategories.has(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded flex-1">
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="secondary">
                        {category.subcategories.length} subcategories
                      </Badge>
                    </CollapsibleTrigger>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateCategory(category)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent className="mt-4">
                    <div className="space-y-3 ml-6">
                      {category.subcategories.map((subcategory) => (
                        <Collapsible
                          key={subcategory.id}
                          open={expandedSubcategories.has(subcategory.id)}
                          onOpenChange={() => toggleSubcategory(subcategory.id)}
                        >
                          <div className="border rounded p-3 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <CollapsibleTrigger className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded flex-1">
                                {expandedSubcategories.has(subcategory.id) ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                                <span className="text-sm font-medium">{subcategory.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {subcategory.jobs.length} jobs
                                </Badge>
                              </CollapsibleTrigger>
                              
                              <div className="flex items-center gap-1">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteSubcategory(subcategory.id, subcategory.name)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <CollapsibleContent className="mt-2">
                              <div className="space-y-2 ml-4">
                                {subcategory.jobs.map((job) => (
                                  <div key={job.id} className="flex items-center justify-between py-1">
                                    <div className="flex-1">
                                      <span className="text-sm">{job.name}</span>
                                      {job.price && (
                                        <span className="text-xs text-gray-500 ml-2">
                                          ${job.price}
                                        </span>
                                      )}
                                      {job.estimatedTime && (
                                        <span className="text-xs text-gray-500 ml-2">
                                          {job.estimatedTime}min
                                        </span>
                                      )}
                                    </div>
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteJob(job.id, job.name)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      <DeleteCategoryDialog
        isOpen={deleteDialog.isOpen}
        category={deleteDialog.category}
        onClose={() => setDeleteDialog({ isOpen: false, category: null })}
        onConfirm={confirmDeleteCategory}
      />
    </>
  );
};

export default ServiceCategoriesManager;
