
import React from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { PlusCircle, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ServiceCategoriesListProps {
  categories: ServiceMainCategory[];
  selectedCategory?: ServiceMainCategory;
  selectedSubcategory?: ServiceSubcategory;
  selectedJob?: ServiceJob;
  onSelectCategory: (category: ServiceMainCategory) => void;
  onSelectSubcategory: (subcategory: ServiceSubcategory) => void;
  onSelectJob: (job: ServiceJob) => void;
  onAddCategory: () => void;
  onAddSubcategory: (categoryId: string) => void;
  onAddJob: (categoryId: string, subcategoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  onDeleteJob: (categoryId: string, subcategoryId: string, jobId: string) => void;
  categoryColors: Record<string, number>;
}

const ServiceCategoriesList: React.FC<ServiceCategoriesListProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  selectedJob,
  onSelectCategory,
  onSelectSubcategory,
  onSelectJob,
  onAddCategory,
  onAddSubcategory,
  onAddJob,
  onDeleteCategory,
  onDeleteSubcategory,
  onDeleteJob,
  categoryColors
}) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = React.useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Service Categories</h2>
        <Button size="sm" onClick={onAddCategory} variant="outline">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-1">
        {categories.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No categories found. Create your first category to get started.
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="border rounded-md overflow-hidden">
              <div 
                className={`flex items-center justify-between p-2 cursor-pointer ${
                  selectedCategory?.id === category.id && !selectedSubcategory ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectCategory(category)}
              >
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedCategories[category.id] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </button>
                  <span className="font-medium">{category.name}</span>
                  <Badge 
                    className={`text-xs ${selectedCategory?.id === category.id ? 'opacity-100' : 'opacity-75'}`}
                    variant="secondary"
                  >
                    {category.subcategories.length}
                  </Badge>
                </div>
                
                <div className="flex items-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSubcategory(category.id);
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete the category "${category.name}" and all its contents?`)) {
                        onDeleteCategory(category.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {expandedCategories[category.id] && (
                <div className="pl-6 border-t">
                  {category.subcategories.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      No subcategories found.
                    </div>
                  ) : (
                    category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="border-b last:border-b-0">
                        <div 
                          className={`flex items-center justify-between p-2 cursor-pointer ${
                            selectedSubcategory?.id === subcategory.id && !selectedJob ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => onSelectSubcategory(subcategory)}
                        >
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubcategory(subcategory.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              {expandedSubcategories[subcategory.id] ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </button>
                            <span className="text-sm">{subcategory.name}</span>
                            <Badge 
                              className="text-xs"
                              variant="outline"
                            >
                              {subcategory.jobs.length}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddJob(category.id, subcategory.id);
                              }}
                            >
                              <PlusCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Are you sure you want to delete the subcategory "${subcategory.name}"`)) {
                                  onDeleteSubcategory(category.id, subcategory.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {expandedSubcategories[subcategory.id] && (
                          <div className="pl-6">
                            {subcategory.jobs.length === 0 ? (
                              <div className="p-2 text-xs text-gray-500">
                                No services found.
                              </div>
                            ) : (
                              subcategory.jobs.map(job => (
                                <div 
                                  key={job.id}
                                  className={`flex items-center justify-between p-2 cursor-pointer text-xs border-t ${
                                    selectedJob?.id === job.id ? 'bg-blue-50' : ''
                                  }`}
                                  onClick={() => onSelectJob(job)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4"></div>
                                    <span>{job.name}</span>
                                    {job.price > 0 && (
                                      <span className="text-gray-500">${job.price.toFixed(2)}</span>
                                    )}
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Are you sure you want to delete the job "${job.name}"`)) {
                                        onDeleteJob(category.id, subcategory.id, job.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-2 w-2" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceCategoriesList;
