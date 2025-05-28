
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Plus, Package, Layers, Wrench, Edit, Trash, Download } from 'lucide-react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ServiceCategoryEditor from './ServiceCategoryEditor';
import ServiceSubcategoryEditor from './ServiceSubcategoryEditor';
import ServiceJobEditor from './ServiceJobEditor';

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<ServiceMainCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<ServiceSubcategory | null>(null);
  const [editingJob, setEditingJob] = useState<ServiceJob | null>(null);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.jobs.some(job => job.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [categories, searchTerm]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  const getSelectedCategoryData = () => {
    if (!selectedCategory) return null;
    return categories.find(cat => cat.id === selectedCategory);
  };

  const getSelectedSubcategoryData = () => {
    if (!selectedCategory || !selectedSubcategory) return null;
    const category = getSelectedCategoryData();
    return category?.subcategories.find(sub => sub.id === selectedSubcategory);
  };

  const exportCategories = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'service-categories.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Service Categories
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <Card className="bg-white shadow-md rounded-xl border border-gray-100">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Service Categories
              <Badge variant="outline" className="ml-2 bg-indigo-100 text-indigo-700 border-indigo-300">
                {categories.length} categories
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={exportCategories} variant="outline" size="sm" className="rounded-full">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={onRefresh} variant="outline" size="sm" className="rounded-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories, subcategories, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
      </Card>

      {categories.length === 0 ? (
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-500 font-medium">No service categories found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Import data or check your database connection
                  </p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Categories Column */}
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-indigo-600" />
                Categories ({filteredCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto h-[500px]">
              <div className="space-y-1 p-4">
                {filteredCategories.map((category) => {
                  const totalJobs = category.subcategories.reduce(
                    (sum, sub) => sum + sub.jobs.length, 
                    0
                  );
                  
                  return (
                    <div
                      key={category.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedCategory === category.id
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1">
                              <Layers className="h-3 w-3 text-blue-500" />
                              <span className="text-blue-600 font-medium">{category.subcategories.length}</span>
                              <span className="text-gray-500">subcategories</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Wrench className="h-3 w-3 text-green-500" />
                              <span className="text-green-600 font-medium">{totalJobs}</span>
                              <span className="text-gray-500">services</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCategory(category);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Subcategories Column */}
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5 text-blue-600" />
                Subcategories {selectedCategory && getSelectedCategoryData() && 
                  `(${getSelectedCategoryData()!.subcategories.length})`
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto h-[500px]">
              {!selectedCategory ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a category to view subcategories</p>
                </div>
              ) : (
                <div className="space-y-1 p-4">
                  {getSelectedCategoryData()?.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedSubcategory === subcategory.id
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSubcategorySelect(subcategory.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {subcategory.name}
                          </h4>
                          {subcategory.description && (
                            <p className="text-gray-600 text-sm mb-2">{subcategory.description}</p>
                          )}
                          <div className="flex items-center gap-1 text-xs">
                            <Wrench className="h-3 w-3 text-green-500" />
                            <span className="text-green-600 font-medium">{subcategory.jobs.length}</span>
                            <span className="text-gray-500">services</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSubcategory(subcategory);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services Column */}
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-green-600" />
                Services {selectedSubcategory && getSelectedSubcategoryData() && 
                  `(${getSelectedSubcategoryData()!.jobs.length})`
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto h-[500px]">
              {!selectedSubcategory ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a subcategory to view services</p>
                </div>
              ) : (
                <div className="space-y-1 p-4">
                  {getSelectedSubcategoryData()?.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 rounded-lg border bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">
                            {job.name}
                          </h5>
                          {job.description && (
                            <p className="text-gray-600 text-sm mb-2">{job.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs">
                            {job.estimatedTime && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {job.estimatedTime} min
                              </Badge>
                            )}
                            {job.price && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                ${job.price}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingJob(job)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Dialogs */}
      {editingCategory && (
        <ServiceCategoryEditor
          category={editingCategory}
          onSave={() => {
            setEditingCategory(null);
            onRefresh();
          }}
          onCancel={() => setEditingCategory(null)}
        />
      )}

      {editingSubcategory && (
        <ServiceSubcategoryEditor
          subcategory={editingSubcategory}
          onSave={() => {
            setEditingSubcategory(null);
            onRefresh();
          }}
          onCancel={() => setEditingSubcategory(null)}
        />
      )}

      {editingJob && (
        <ServiceJobEditor
          job={editingJob}
          onSave={() => {
            setEditingJob(null);
            onRefresh();
          }}
          onCancel={() => setEditingJob(null)}
        />
      )}
    </div>
  );
};

export default ServiceHierarchyBrowser;
