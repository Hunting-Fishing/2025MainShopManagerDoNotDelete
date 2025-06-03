
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Building2,
  Wrench,
  Clock,
  DollarSign
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { deleteServiceCategory, deleteServiceSubcategory, deleteServiceJob } from '@/lib/services/serviceApi';
import { toast } from 'sonner';
import { useServiceSearch } from '@/hooks/useServiceSearch';

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

  const {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    searchStats,
    isSearching
  } = useServiceSearch(categories);

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

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      toast.success('Category deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    try {
      await deleteServiceSubcategory(subcategoryId);
      toast.success('Subcategory deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteServiceJob(jobId);
      toast.success('Service deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading service categories...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Service Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services, categories, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          {isSearching && searchStats && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  Found {searchStats.jobs} services in {searchStats.categories} categories
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear search
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isSearching ? 'No results found' : 'No service categories'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isSearching 
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating your first service category'
                }
              </p>
              {!isSearching && (
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Category
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <Collapsible
                open={expandedCategories.has(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        {category.description && (
                          <p className="text-gray-600 text-sm">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {category.subcategories.length} subcategories
                      </Badge>
                      <Badge variant="outline">
                        {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement edit functionality
                          toast.info('Edit functionality will be implemented soon');
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({ isOpen: true, category });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t bg-gray-50 p-4">
                    {category.subcategories.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-2">No subcategories yet</p>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Subcategory
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="bg-white rounded-lg border">
                            <Collapsible
                              open={expandedSubcategories.has(subcategory.id)}
                              onOpenChange={() => toggleSubcategory(subcategory.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    {expandedSubcategories.has(subcategory.id) ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                    <div>
                                      <h4 className="font-medium">{subcategory.name}</h4>
                                      {subcategory.description && (
                                        <p className="text-gray-600 text-sm">{subcategory.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {subcategory.jobs.length} services
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.info('Edit functionality will be implemented soon');
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSubcategory(subcategory.id);
                                      }}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="border-t bg-gray-50 p-3">
                                  {subcategory.jobs.length === 0 ? (
                                    <div className="text-center py-4">
                                      <p className="text-gray-500 text-sm mb-2">No services yet</p>
                                      <Button size="sm" variant="outline" className="gap-2">
                                        <Plus className="h-3 w-3" />
                                        Add Service
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {subcategory.jobs.map((job) => (
                                        <div
                                          key={job.id}
                                          className="bg-white rounded border p-3 flex items-center justify-between"
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <Wrench className="h-4 w-4 text-blue-600" />
                                              <span className="font-medium">{job.name}</span>
                                            </div>
                                            {job.description && (
                                              <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2">
                                              {job.estimatedTime && (
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                  <Clock className="h-3 w-3" />
                                                  {job.estimatedTime}min
                                                </div>
                                              )}
                                              {job.price && (
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                  <DollarSign className="h-3 w-3" />
                                                  ${job.price}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => toast.info('Edit functionality will be implemented soon')}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteJob(job.id)}
                                              className="text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      <DeleteCategoryDialog
        isOpen={deleteDialog.isOpen}
        category={deleteDialog.category}
        onClose={() => setDeleteDialog({ isOpen: false, category: null })}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
};

export default ServiceCategoriesManager;
