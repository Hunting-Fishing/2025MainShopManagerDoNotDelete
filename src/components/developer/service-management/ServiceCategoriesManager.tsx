import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  FolderOpen,
  Briefcase,
  Clock,
  DollarSign
} from 'lucide-react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { 
  deleteServiceCategory, 
  deleteServiceSubcategory, 
  deleteServiceJob,
  updateServiceCategory,
  updateServiceSubcategory,
  updateServiceJob
} from '@/lib/services/serviceApi';
import { formatEstimatedTime, formatPrice } from '@/lib/services/serviceUtils';
import { toast } from 'sonner';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import ServiceCategoryEditor from './ServiceCategoryEditor';
import ServiceSubcategoryEditor from './ServiceSubcategoryEditor';
import ServiceJobEditor from './ServiceJobEditor';
import { EditSubcategoryDialog } from './EditSubcategoryDialog';
import { EditJobDialog } from './EditJobDialog';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Delete dialog states
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    category: ServiceMainCategory | null;
  }>({ isOpen: false, category: null });

  // Edit dialog states
  const [editCategoryDialog, setEditCategoryDialog] = useState<{
    isOpen: boolean;
    category: ServiceMainCategory | null;
  }>({ isOpen: false, category: null });

  const [editSubcategoryDialog, setEditSubcategoryDialog] = useState<{
    isOpen: boolean;
    subcategory: ServiceSubcategory | null;
  }>({ isOpen: false, subcategory: null });

  const [editJobDialog, setEditJobDialog] = useState<{
    isOpen: boolean;
    job: ServiceJob | null;
  }>({ isOpen: false, job: null });

  const filteredCategories = categories.filter(category => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    
    const categoryMatches = category.name.toLowerCase().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower));
    
    const subcategoryMatches = category.subcategories.some(sub =>
      sub.name.toLowerCase().includes(searchLower) ||
      (sub.description && sub.description.toLowerCase().includes(searchLower)) ||
      sub.jobs.some(job =>
        job.name.toLowerCase().includes(searchLower) ||
        (job.description && job.description.toLowerCase().includes(searchLower))
      )
    );
    
    return categoryMatches || subcategoryMatches;
  });

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
      toast.success('Job deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleUpdateCategory = async (categoryId: string, updates: Partial<ServiceMainCategory>) => {
    await updateServiceCategory(categoryId, updates);
    onRefresh();
  };

  const handleUpdateSubcategory = async (subcategoryId: string, updates: Partial<ServiceSubcategory>) => {
    await updateServiceSubcategory(subcategoryId, updates);
    onRefresh();
  };

  const handleUpdateJob = async (jobId: string, updates: Partial<ServiceJob>) => {
    await updateServiceJob(jobId, updates);
    onRefresh();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading service categories...</div>
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
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Service Categories Manager
            </CardTitle>
            <Button onClick={onRefresh} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories, subcategories, or jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No service categories found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div key={category.id} className="border rounded-lg">
                  <div className="p-4 bg-blue-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className="p-1 h-6 w-6"
                        >
                          {expandedCategories.has(category.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {category.subcategories.length} subcategories
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditCategoryDialog({ isOpen: true, category })}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ isOpen: true, category })}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {expandedCategories.has(category.id) && (
                    <div className="p-4">
                      {category.subcategories.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No subcategories in this category
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {category.subcategories.map((subcategory) => (
                            <div key={subcategory.id} className="border rounded-md">
                              <div className="p-3 bg-green-50 border-b">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleSubcategoryExpansion(subcategory.id)}
                                      className="p-1 h-6 w-6"
                                    >
                                      {expandedSubcategories.has(subcategory.id) ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Briefcase className="h-4 w-4 text-green-600" />
                                    <div>
                                      <h4 className="font-medium">{subcategory.name}</h4>
                                      {subcategory.description && (
                                        <p className="text-sm text-gray-600">{subcategory.description}</p>
                                      )}
                                    </div>
                                    <Badge variant="outline">
                                      {subcategory.jobs.length} jobs
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditSubcategoryDialog({ isOpen: true, subcategory })}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {expandedSubcategories.has(subcategory.id) && (
                                <div className="p-3">
                                  {subcategory.jobs.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                      No jobs in this subcategory
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {subcategory.jobs.map((job) => (
                                        <div key={job.id} className="flex items-center justify-between p-3 bg-orange-50 rounded border">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <h5 className="font-medium">{job.name}</h5>
                                              {job.estimatedTime && (
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                  <Clock className="h-3 w-3" />
                                                  {formatEstimatedTime(job.estimatedTime)}
                                                </div>
                                              )}
                                              {job.price && (
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                  <DollarSign className="h-3 w-3" />
                                                  {formatPrice(job.price)}
                                                </div>
                                              )}
                                            </div>
                                            {job.description && (
                                              <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setEditJobDialog({ isOpen: true, job })}
                                              className="h-8 w-8 p-0"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteJob(job.id)}
                                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialogs */}
      {editCategoryDialog.category && (
        <ServiceCategoryEditor
          category={editCategoryDialog.category}
          onSave={() => {
            setEditCategoryDialog({ isOpen: false, category: null });
            onRefresh();
          }}
          onCancel={() => setEditCategoryDialog({ isOpen: false, category: null })}
        />
      )}

      <EditSubcategoryDialog
        isOpen={editSubcategoryDialog.isOpen}
        subcategory={editSubcategoryDialog.subcategory}
        onClose={() => setEditSubcategoryDialog({ isOpen: false, subcategory: null })}
        onSave={handleUpdateSubcategory}
      />

      <EditJobDialog
        isOpen={editJobDialog.isOpen}
        job={editJobDialog.job}
        onClose={() => setEditJobDialog({ isOpen: false, job: null })}
        onSave={handleUpdateJob}
      />

      {/* Delete Dialog */}
      <DeleteCategoryDialog
        isOpen={deleteDialog.isOpen}
        category={deleteDialog.category}
        onClose={() => setDeleteDialog({ isOpen: false, category: null })}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
};

export default ServiceCategoriesManager;
