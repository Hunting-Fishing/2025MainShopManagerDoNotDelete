
import React, { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, Layers, Wrench, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  onRefresh: () => void;
}

const ServiceHierarchyBrowser: React.FC<ServiceHierarchyBrowserProps> = ({
  categories,
  isLoading,
  onRefresh
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

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
      <Card className="bg-white shadow-md rounded-xl border border-gray-100">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Service Hierarchy Browser
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading service categories from database...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-md rounded-xl border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Service Hierarchy Browser
            <Badge variant="outline" className="ml-2 bg-indigo-100 text-indigo-700 border-indigo-300">
              {categories.length} categories
            </Badge>
          </CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm" className="rounded-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">No service categories found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your imported data might not have been processed correctly. Check the debug section below.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              const totalJobs = category.subcategories.reduce(
                (sum, sub) => sum + sub.jobs.length, 
                0
              );
              
              return (
                <Collapsible key={category.id} open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                  <div className="border rounded-xl bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                          <div className="text-left">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-gray-600 text-sm">{category.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Layers className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-600">
                              <span className="font-medium text-blue-600">{category.subcategories.length}</span> subcategories
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Wrench className="h-4 w-4 text-green-500" />
                            <span className="text-gray-600">
                              <span className="font-medium text-green-600">{totalJobs}</span> services
                            </span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <div className="ml-7 space-y-3">
                          {category.subcategories.map((subcategory) => {
                            const isSubExpanded = expandedSubcategories.has(subcategory.id);
                            
                            return (
                              <Collapsible key={subcategory.id} open={isSubExpanded} onOpenChange={() => toggleSubcategory(subcategory.id)}>
                                <div className="border-l-2 border-indigo-200 pl-4">
                                  <CollapsibleTrigger className="w-full">
                                    <div className="flex items-center justify-between py-2">
                                      <div className="flex items-center gap-2">
                                        {isSubExpanded ? (
                                          <ChevronDown className="h-3 w-3 text-gray-400" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 text-gray-400" />
                                        )}
                                        <span className="font-medium text-gray-800">{subcategory.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {subcategory.jobs.length} jobs
                                        </Badge>
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>
                                  
                                  <CollapsibleContent>
                                    <div className="ml-5 mt-2 space-y-2">
                                      {subcategory.jobs.map((job) => (
                                        <div key={job.id} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-sm">
                                          <span className="text-gray-700">{job.name}</span>
                                          <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {job.estimatedTime && (
                                              <span>{job.estimatedTime}min</span>
                                            )}
                                            {job.price && (
                                              <span>${job.price}</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            );
                          })}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceHierarchyBrowser;
