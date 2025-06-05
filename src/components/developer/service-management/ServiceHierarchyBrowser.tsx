
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Plus, Upload, Download } from 'lucide-react';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { ServiceBulkImport } from './ServiceBulkImport';

export const ServiceHierarchyBrowser: React.FC = () => {
  const { categories, loading, error, refetch } = useServiceCategories();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddCategory = () => {
    console.log('Add new category');
    // TODO: Implement add category dialog
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading service categories...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-center py-4">
            Error loading categories: {error}
          </div>
          <div className="flex justify-center">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Categories</CardTitle>
            <div className="flex space-x-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleAddCategory} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {categories.length} categories • {categories.reduce((acc, cat) => acc + cat.subcategories.length, 0)} subcategories • {categories.reduce((acc, cat) => acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.jobs.length, 0), 0)} services
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="browser" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browser">Browse</TabsTrigger>
              <TabsTrigger value="import">
                <Upload className="h-4 w-4 mr-2" />
                Import Services
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="h-4 w-4 mr-2" />
                Export Services
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="browser" className="mt-4">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No service categories found</p>
                  <p className="text-sm text-muted-foreground">
                    Start by importing services or creating new categories
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        {category.subcategories.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No subcategories</p>
                        ) : (
                          <div className="space-y-3">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="border-l-2 border-gray-200 pl-4">
                                <h4 className="font-medium">{subcategory.name}</h4>
                                {subcategory.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{subcategory.description}</p>
                                )}
                                {subcategory.jobs.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No services</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {subcategory.jobs.map((job) => (
                                      <div key={job.id} className="bg-gray-50 rounded p-2">
                                        <p className="text-sm font-medium">{job.name}</p>
                                        {job.description && (
                                          <p className="text-xs text-muted-foreground">{job.description}</p>
                                        )}
                                        <div className="flex justify-between items-center mt-1">
                                          {job.estimatedTime && (
                                            <span className="text-xs text-blue-600">{job.estimatedTime}min</span>
                                          )}
                                          {job.price && (
                                            <span className="text-xs text-green-600">${job.price}</span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="import" className="mt-4">
              <ServiceBulkImport onImportComplete={refetch} />
            </TabsContent>
            
            <TabsContent value="export" className="mt-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Export Services</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export your current service hierarchy to a CSV file for backup or transfer.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Current Data:</strong>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        <li>{categories.length} categories</li>
                        <li>{categories.reduce((acc, cat) => acc + cat.subcategories.length, 0)} subcategories</li>
                        <li>{categories.reduce((acc, cat) => acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.jobs.length, 0), 0)} services</li>
                      </ul>
                    </div>
                    
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export to CSV
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
