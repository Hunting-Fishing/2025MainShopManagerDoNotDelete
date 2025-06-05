
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Database, ChevronRight, Folder } from 'lucide-react';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { ServiceBulkImport } from './ServiceBulkImport';

export const ServiceHierarchyBrowser: React.FC = () => {
  const { sectors, loading, error, refetch } = useServiceSectors();
  const [activeTab, setActiveTab] = useState('browse');

  const handleImportComplete = async () => {
    console.log('Import completed, refreshing service sectors...');
    await refetch();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading service hierarchy...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Browse Services
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Services
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                4-Tier Service Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sectors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No services found</p>
                  <p className="text-sm">Import services to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sectors.map((sector) => (
                    <div key={sector.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-transparent">
                      <div className="flex items-center mb-3">
                        <Folder className="h-5 w-5 mr-2 text-blue-600" />
                        <h2 className="font-bold text-xl text-blue-800">{sector.name}</h2>
                      </div>
                      {sector.description && (
                        <p className="text-gray-600 mb-4">{sector.description}</p>
                      )}
                      
                      {sector.categories.map((category) => (
                        <div key={category.id} className="ml-6 mt-4 border-l-2 border-blue-200 pl-4">
                          <div className="flex items-center mb-2">
                            <ChevronRight className="h-4 w-4 mr-1 text-blue-500" />
                            <h3 className="font-semibold text-lg text-blue-700">{category.name}</h3>
                          </div>
                          {category.description && (
                            <p className="text-gray-600 mb-3 text-sm">{category.description}</p>
                          )}
                          
                          {category.subcategories.map((subcategory) => (
                            <div key={subcategory.id} className="ml-6 mt-3 border-l-2 border-gray-200 pl-4">
                              <div className="flex items-center mb-2">
                                <ChevronRight className="h-3 w-3 mr-1 text-gray-500" />
                                <h4 className="font-medium text-gray-700">{subcategory.name}</h4>
                              </div>
                              {subcategory.description && (
                                <p className="text-gray-500 text-sm mb-2">{subcategory.description}</p>
                              )}
                              
                              {subcategory.jobs.length > 0 && (
                                <div className="ml-4 mt-2">
                                  {subcategory.jobs.map((job) => (
                                    <div key={job.id} className="py-1 text-sm border-b border-gray-100 last:border-b-0">
                                      <span className="font-medium text-gray-800">{job.name}</span>
                                      {job.price && (
                                        <span className="text-green-600 ml-2">${job.price}</span>
                                      )}
                                      {job.estimatedTime && (
                                        <span className="text-gray-500 ml-2">({job.estimatedTime} min)</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="import" className="space-y-4">
          <ServiceBulkImport onImportComplete={handleImportComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
