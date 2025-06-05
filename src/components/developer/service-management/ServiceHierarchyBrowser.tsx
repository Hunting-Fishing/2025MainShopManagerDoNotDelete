
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ServiceSectorsList } from './ServiceSectorsList';
import { ServiceHierarchyExcelView } from './ServiceHierarchyExcelView';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { Loader2, Building, TreePine, Table, Plus, Upload } from 'lucide-react';

export function ServiceHierarchyBrowser() {
  const { sectors, loading, error, refetch } = useServiceSectors();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy Browser</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Error loading service hierarchy: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalCategories = sectors.reduce((acc, sector) => acc + sector.categories.length, 0);
  const totalServices = sectors.reduce((acc, sector) => 
    acc + sector.categories.reduce((catAcc, category) => 
      catAcc + category.subcategories.reduce((subAcc, subcategory) => 
        subAcc + subcategory.jobs.length, 0), 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Hierarchy Browser</h2>
          <p className="text-muted-foreground">
            Manage your service structure and categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}>
            <Building className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Services
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Tree View
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Excel Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ServiceSectorsList />
        </TabsContent>

        <TabsContent value="tree" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TreePine className="h-5 w-5" />
                  <span>Service Hierarchy Tree</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{sectors.length} sectors</Badge>
                  <Badge variant="outline">{totalCategories} categories</Badge>
                  <Badge variant="outline">{totalServices} services</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sectors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <TreePine className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No service hierarchy found</p>
                  <p className="text-sm">Import services or create your first category to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sectors.map((sector) => (
                    <div key={sector.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{sector.name}</h3>
                        <Badge variant="outline">{sector.categories.length} categories</Badge>
                      </div>
                      <div className="space-y-3 ml-4">
                        {sector.categories.map((category) => (
                          <div key={category.id} className="border-l-2 border-blue-200 pl-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-blue-700">{category.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {category.subcategories.length} subcategories
                              </Badge>
                            </div>
                            <div className="space-y-2 ml-4">
                              {category.subcategories.map((subcategory) => (
                                <div key={subcategory.id} className="border-l-2 border-green-200 pl-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="text-sm font-medium text-green-700">
                                      {subcategory.name}
                                    </h5>
                                    <Badge variant="outline" className="text-xs">
                                      {subcategory.jobs.length} services
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-4">
                                    {subcategory.jobs.map((job) => (
                                      <div key={job.id} className="text-sm p-2 bg-gray-50 rounded border">
                                        <div className="font-medium">{job.name}</div>
                                        {job.description && (
                                          <div className="text-xs text-gray-600 mt-1">
                                            {job.description}
                                          </div>
                                        )}
                                        <div className="flex justify-between items-center mt-1">
                                          {job.estimatedTime && (
                                            <span className="text-xs text-blue-600">
                                              {job.estimatedTime}min
                                            </span>
                                          )}
                                          {job.price && (
                                            <span className="text-xs font-medium text-green-600">
                                              ${job.price}
                                            </span>
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <ServiceHierarchyExcelView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
