
import React from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading categories...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Service Categories</CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No service categories found</p>
            <p className="text-sm text-gray-400 mt-2">
              Use the Import/Export tab to add service categories
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg">{category.name}</h3>
                {category.description && (
                  <p className="text-gray-600 mt-1">{category.description}</p>
                )}
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    {category.subcategories?.length || 0} subcategories
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceCategoriesManager;
