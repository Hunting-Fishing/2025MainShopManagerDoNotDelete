
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Wrench, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceCategoriesManagerProps {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  onRefresh?: () => void;
}

const ServiceCategoriesManager: React.FC<ServiceCategoriesManagerProps> = ({ 
  categories, 
  isLoading,
  onRefresh 
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
        toast.success('Service categories refreshed');
      } catch (error) {
        toast.error('Failed to refresh service categories');
      } finally {
        setRefreshing(false);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-indigo-600" />
            Service Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading service categories...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-indigo-600" />
              Service Categories
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No service categories found</p>
            <p className="text-sm text-gray-400 mb-4">
              Import your service hierarchy using Excel or set up your service offerings manually
            </p>
            <div className="flex gap-2 justify-center">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Category
              </Button>
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Check Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalServices = categories.reduce((total, category) => 
    total + category.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-indigo-600" />
            Service Categories
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {categories.length} categories, {totalServices} services
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{subcategory.name}</h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {subcategory.jobs.length} services
                      </Badge>
                    </div>
                    {subcategory.description && (
                      <p className="text-gray-600 text-sm mb-2">{subcategory.description}</p>
                    )}
                    
                    <div className="space-y-1">
                      {subcategory.jobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">{job.name}</span>
                            {job.description && (
                              <span className="text-gray-500 ml-2">- {job.description}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {job.price && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                ${job.price}
                              </Badge>
                            )}
                            {job.estimatedTime && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                {job.estimatedTime}min
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCategoriesManager;
