
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Edit, Plus, Trash2, Database, Filter } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { useServiceFiltering } from './useServiceFiltering';
import ServiceAdvancedFilters from './ServiceAdvancedFilters';

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
  const {
    filters,
    setFilters,
    resetFilters,
    isFiltersExpanded,
    toggleFiltersExpanded,
    filteredCategories,
    filteredServicesCount,
    totalServicesCount
  } = useServiceFiltering(categories);

  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = React.useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading service categories...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <ServiceAdvancedFilters
        categories={categories}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        isExpanded={isFiltersExpanded}
        onToggleExpanded={toggleFiltersExpanded}
      />

      {/* Results Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle className="text-lg">Service Categories</CardTitle>
              <Badge variant="outline">
                {filteredServicesCount} of {totalServicesCount} services
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Categories List */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-gray-500">
                {totalServicesCount === 0 ? (
                  <>
                    <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No service categories found</p>
                    <p>Start by importing service data or creating categories manually.</p>
                  </>
                ) : (
                  <>
                    <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No services match your filters</p>
                    <p>Try adjusting your search criteria or clearing some filters.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={resetFilters}
                    >
                      Clear All Filters
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCategories.map((category) => (
            <Card key={category.id}>
              <Collapsible 
                open={expandedCategories.has(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
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
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3 ml-7">
                      {category.subcategories.map((subcategory) => (
                        <Card key={subcategory.id} className="bg-gray-50">
                          <Collapsible 
                            open={expandedSubcategories.has(subcategory.id)}
                            onOpenChange={() => toggleSubcategory(subcategory.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-100 transition-colors py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {expandedSubcategories.has(subcategory.id) ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    <div>
                                      <h4 className="font-medium">{subcategory.name}</h4>
                                      {subcategory.description && (
                                        <p className="text-sm text-gray-600">{subcategory.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {subcategory.jobs.length} services
                                    </Badge>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="space-y-2 ml-6">
                                  {subcategory.jobs.map((job) => (
                                    <div 
                                      key={job.id} 
                                      className="flex items-center justify-between p-3 bg-white rounded border"
                                    >
                                      <div className="flex-1">
                                        <h5 className="font-medium">{job.name}</h5>
                                        {job.description && (
                                          <p className="text-sm text-gray-600">{job.description}</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {job.price && (
                                          <Badge variant="secondary" className="text-xs">
                                            ${job.price}
                                          </Badge>
                                        )}
                                        {job.estimatedTime && (
                                          <Badge variant="outline" className="text-xs">
                                            {job.estimatedTime}min
                                          </Badge>
                                        )}
                                        <div className="flex gap-1">
                                          <Button variant="ghost" size="sm">
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <Button variant="ghost" size="sm">
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceCategoriesManager;
