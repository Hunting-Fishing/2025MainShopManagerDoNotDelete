
import React from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, Layers, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  if (isLoading) {
    return (
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
    );
  }

  return (
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
                  Check your database connection or import service data
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const totalJobs = category.subcategories.reduce(
                (sum, sub) => sum + sub.jobs.length, 
                0
              );
              
              return (
                <div key={category.id} className="border rounded-xl p-4 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {category.name}
                      </h3>
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
                    <Badge 
                      variant="secondary" 
                      className="bg-indigo-100 text-indigo-800 border border-indigo-200"
                    >
                      Active
                    </Badge>
                  </div>
                  
                  {category.subcategories.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.slice(0, 3).map((sub) => (
                          <Badge 
                            key={sub.id} 
                            variant="outline" 
                            className="text-xs bg-white border-gray-300 text-gray-700"
                          >
                            {sub.name} ({sub.jobs.length})
                          </Badge>
                        ))}
                        {category.subcategories.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 border-gray-300 text-gray-500">
                            +{category.subcategories.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceCategoriesManager;
