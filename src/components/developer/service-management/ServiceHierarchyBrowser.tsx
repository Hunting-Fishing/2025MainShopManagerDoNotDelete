
import React, { useState, useEffect } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Package, Layers, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { 
  createServiceCategory, 
  updateServiceCategory, 
  deleteServiceCategory,
  deleteServiceSubcategory,
  deleteServiceJob 
} from '@/lib/services/serviceApi';
import { categoryColors } from './CategoryColorConfig';

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
  isLoading: boolean;
}

const ServiceHierarchyBrowser: React.FC<ServiceHierarchyBrowserProps> = ({
  categories,
  onRefresh,
  isLoading
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<{ type: string; id: string; name: string } | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (selectedCategory && selectedCategory.subcategories.length > 0 && !selectedSubcategory) {
      setSelectedSubcategory(selectedCategory.subcategories[0]);
    } else if (selectedCategory && selectedCategory.subcategories.length === 0) {
      setSelectedSubcategory(null);
    }
  }, [selectedCategory]);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditItem = async (type: string, id: string, newName: string) => {
    try {
      if (type === 'category' && selectedCategory) {
        const updatedCategory = { ...selectedCategory, name: newName };
        await updateServiceCategory(id, updatedCategory);
        toast.success('Category updated successfully');
        onRefresh();
      }
      // Add logic for subcategory and job updates
      setEditingItem(null);
    } catch (error) {
      toast.error('Failed to update item');
      console.error('Update error:', error);
    }
  };

  const handleDeleteItem = async (type: string, id: string) => {
    try {
      if (type === 'category') {
        await deleteServiceCategory(id);
        toast.success('Category deleted successfully');
      } else if (type === 'subcategory' && selectedCategory) {
        await deleteServiceSubcategory(selectedCategory.id, id);
        toast.success('Subcategory deleted successfully');
      } else if (type === 'job' && selectedCategory && selectedSubcategory) {
        await deleteServiceJob(selectedCategory.id, selectedSubcategory.id, id);
        toast.success('Service deleted successfully');
      }
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete item');
      console.error('Delete error:', error);
    }
  };

  const getCategoryColor = (index: number) => {
    const colorIndex = index % categoryColors.length;
    return categoryColors[colorIndex];
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search categories, subcategories, and services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Categories Column */}
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Categories
              <Badge variant="outline" className="ml-auto bg-indigo-100 text-indigo-700 border-indigo-300">
                {filteredCategories.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto">
              {filteredCategories.map((category, index) => {
                const color = getCategoryColor(index);
                const isSelected = selectedCategory?.id === category.id;
                
                return (
                  <div
                    key={category.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedSubcategory(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color.bg} ${color.border} border`}></div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{category.subcategories.length} subcategories</span>
                          <span>•</span>
                          <span>{category.subcategories.reduce((sum, sub) => sum + sub.jobs.length, 0)} services</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
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
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Subcategories
              <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-700 border-blue-300">
                {selectedCategory?.subcategories.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto">
              {selectedCategory ? (
                selectedCategory.subcategories.map((subcategory) => {
                  const isSelected = selectedSubcategory?.id === subcategory.id;
                  
                  return (
                    <div
                      key={subcategory.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => setSelectedSubcategory(subcategory)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{subcategory.name}</h3>
                          {subcategory.description && (
                            <p className="text-sm text-gray-600 mt-1">{subcategory.description}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {subcategory.jobs.length} services
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem('subcategory', subcategory.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a category to view subcategories</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services Column */}
        <Card className="bg-white shadow-md rounded-xl border border-gray-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-600" />
              Services
              <Badge variant="outline" className="ml-auto bg-purple-100 text-purple-700 border-purple-300">
                {selectedSubcategory?.jobs.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto">
              {selectedSubcategory ? (
                selectedSubcategory.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{job.name}</h3>
                        {job.description && (
                          <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          {job.price && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              ${job.price}
                            </Badge>
                          )}
                          {job.estimatedTime && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {job.estimatedTime} min
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteItem('job', job.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a subcategory to view services</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceHierarchyBrowser;
