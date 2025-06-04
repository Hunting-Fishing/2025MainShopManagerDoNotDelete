
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

interface ServiceCategoryListProps {
  categories: ServiceMainCategory[];
  onAddCategory: () => void;
  onEditCategory: (category: ServiceMainCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddSubcategory: (categoryId: string) => void;
  onEditSubcategory: (subcategory: ServiceSubcategory) => void;
  onDeleteSubcategory: (subcategoryId: string) => void;
  onAddJob: (subcategoryId: string) => void;
  onEditJob: (job: ServiceJob) => void;
  onDeleteJob: (jobId: string) => void;
}

export const ServiceCategoryList: React.FC<ServiceCategoryListProps> = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onAddJob,
  onEditJob,
  onDeleteJob
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev =>
      prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories.some(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.jobs.some(job =>
        job.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search categories, subcategories, or jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={onAddCategory} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No categories found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search terms
              </p>
            ) : (
              <Button onClick={onAddCategory} className="mt-4">
                Create your first category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {expandedCategories.includes(category.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddSubcategory(category.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedCategories.includes(category.id) && (
                <CardContent className="pt-0">
                  {category.subcategories.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>No subcategories yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddSubcategory(category.id)}
                        className="mt-2"
                      >
                        Add Subcategory
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {category.subcategories.map((subcategory) => (
                        <Card key={subcategory.id} className="ml-4">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSubcategory(subcategory.id)}
                                >
                                  {expandedSubcategories.includes(subcategory.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                <div>
                                  <h4 className="font-medium">{subcategory.name}</h4>
                                  {subcategory.description && (
                                    <p className="text-sm text-gray-600">
                                      {subcategory.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAddJob(subcategory.id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onEditSubcategory(subcategory)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDeleteSubcategory(subcategory.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          {expandedSubcategories.includes(subcategory.id) && (
                            <CardContent className="pt-0">
                              {subcategory.jobs.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                  <p>No jobs yet</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onAddJob(subcategory.id)}
                                    className="mt-2"
                                  >
                                    Add Job
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {subcategory.jobs.map((job) => (
                                    <div
                                      key={job.id}
                                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                                    >
                                      <div className="flex-1">
                                        <h5 className="font-medium">{job.name}</h5>
                                        {job.description && (
                                          <p className="text-sm text-gray-600">
                                            {job.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-1">
                                          <span className="text-sm text-gray-500">
                                            ${job.base_price}
                                          </span>
                                          <span className="text-sm text-gray-500">
                                            {job.estimated_duration} min
                                          </span>
                                          <Badge variant="outline" className="text-xs">
                                            {job.skill_level}
                                          </Badge>
                                          <Badge variant={job.is_active ? "default" : "secondary"}>
                                            {job.is_active ? "Active" : "Inactive"}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onEditJob(job)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onDeleteJob(job.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
