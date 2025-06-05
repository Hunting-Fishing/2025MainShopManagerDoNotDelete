import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ServiceSectorsList } from './ServiceSectorsList';
import { ServiceHierarchyExcelView } from './ServiceHierarchyExcelView';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { Loader2, Search, Plus, TreePine, Table } from 'lucide-react';

export function ServiceHierarchyBrowser() {
  const { sectors, loading, error } = useServiceSectors();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleSector = (sectorId: string) => {
    setExpandedSectors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectorId)) {
        newSet.delete(sectorId);
      } else {
        newSet.add(sectorId);
      }
      return newSet;
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredSectors = sectors.filter((sector) => {
    const sectorMatch = sector.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = sector.categories.some((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const subcategoryMatch = sector.categories.some((category) =>
      category.subcategories.some((subcategory) =>
        subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    const jobMatch = sector.categories.some((category) =>
      category.subcategories.some((subcategory) =>
        subcategory.jobs.some((job) => job.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
    return sectorMatch || categoryMatch || subcategoryMatch || jobMatch;
  });

  const handleSaveChanges = async (updatedSectors: any[]) => {
    try {
      // TODO: Implement save functionality
      console.log('Saving changes:', updatedSectors);
      // This would typically call an API to update the service hierarchy
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Error loading services: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceSectorsList />
      
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tree" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tree" className="flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                Tree View
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Excel Table
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tree" className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sector
                </Button>
              </div>

              {sectors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TreePine className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No service sectors found</p>
                  <p className="text-sm">Create your first service sector to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSectors.map((sector) => (
                    <Card key={sector.id} className="border">
                      <CardHeader 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSector(sector.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <TreePine className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg">{sector.name}</CardTitle>
                            <Badge variant="outline">
                              {sector.categories.length} categories
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Add Category
                            </Button>
                          </div>
                        </div>
                        {sector.description && (
                          <p className="text-sm text-gray-600 mt-2">{sector.description}</p>
                        )}
                      </CardHeader>
                      
                      {expandedSectors.has(sector.id) && (
                        <CardContent className="pt-0">
                          <div className="space-y-3 ml-6">
                            {sector.categories.map((category) => (
                              <div key={category.id} className="border-l-2 border-gray-200 pl-4">
                                <div 
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                                  onClick={() => toggleCategory(category.id)}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{category.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {category.subcategories.length} subcategories
                                    </Badge>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Subcategory
                                  </Button>
                                </div>
                                
                                {expandedCategories.has(category.id) && (
                                  <div className="mt-3 space-y-2 ml-4">
                                    {category.subcategories.map((subcategory) => (
                                      <div key={subcategory.id} className="p-2 bg-white rounded border">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium">{subcategory.name}</span>
                                          <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="text-xs">
                                              {subcategory.jobs.length} services
                                            </Badge>
                                            <Button variant="ghost" size="sm">
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add Service
                                            </Button>
                                          </div>
                                        </div>
                                        
                                        {subcategory.jobs.length > 0 && (
                                          <div className="mt-2 space-y-1">
                                            {subcategory.jobs.map((job) => (
                                              <div key={job.id} className="text-xs p-2 bg-gray-50 rounded flex items-center justify-between">
                                                <span>{job.name}</span>
                                                <div className="flex items-center space-x-2">
                                                  {job.estimatedTime && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {job.estimatedTime}min
                                                    </Badge>
                                                  )}
                                                  {job.price && (
                                                    <Badge variant="outline" className="text-xs">
                                                      ${job.price}
                                                    </Badge>
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
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="table">
              <ServiceHierarchyExcelView 
                sectors={sectors}
                onSave={handleSaveChanges}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
