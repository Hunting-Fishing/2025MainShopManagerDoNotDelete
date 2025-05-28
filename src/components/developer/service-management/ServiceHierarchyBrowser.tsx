
import React, { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Package, Layers, Wrench, Search, Plus, Upload } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories.some(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.jobs.some(job => job.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Service Hierarchy Browser
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                <p className="text-gray-600">Loading service categories from database...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
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
        
        {categories.length > 0 && (
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search services, categories, or jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Content */}
      {categories.length === 0 ? (
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service Categories Found</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    Get started by importing service categories from an Excel file or creating them manually.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
                      <Upload className="h-4 w-4 mr-2" />
                      Import from Excel
                    </Button>
                    <Button variant="outline" className="rounded-full px-6">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Category
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => {
            const totalJobs = category.subcategories.reduce(
              (sum, sub) => sum + sub.jobs.length, 
              0
            );
            const isExpanded = expandedCategories.has(category.id);
            
            return (
              <Card key={category.id} className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {category.name}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className="bg-indigo-100 text-indigo-800 border border-indigo-200"
                            >
                              Active
                            </Badge>
                          </div>
                          {category.description && (
                            <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                          )}
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
                        <div className="text-2xl text-gray-400">
                          {isExpanded ? '−' : '+'}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="border-t border-gray-100 bg-gray-50">
                      <div className="space-y-6 p-4">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900 text-base">{subcategory.name}</h4>
                              <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                                {subcategory.jobs.length} services
                              </Badge>
                            </div>
                            {subcategory.description && (
                              <p className="text-sm text-gray-600 mb-3">{subcategory.description}</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {subcategory.jobs.map((job) => (
                                <div key={job.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-colors">
                                  <h5 className="font-medium text-sm text-gray-900 mb-1">{job.name}</h5>
                                  {job.description && (
                                    <p className="text-xs text-gray-600 mb-2">{job.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs">
                                    {job.estimatedTime && (
                                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                        <Wrench className="h-3 w-3" />
                                        {job.estimatedTime}min
                                      </Badge>
                                    )}
                                    {job.price && (
                                      <Badge variant="outline" className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border-green-200">
                                        ${job.price}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {categories.length > 0 && filteredCategories.length === 0 && (
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardContent className="p-8">
            <div className="text-center">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-500">
                No services match your search criteria. Try adjusting your search terms.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceHierarchyBrowser;
