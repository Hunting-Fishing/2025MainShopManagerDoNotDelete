
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { ServiceSector } from '@/types/serviceHierarchy';

interface ServiceHierarchyTreeViewProps {
  sectors: ServiceSector[];
  onSave?: (data: any) => void;
}

export function ServiceHierarchyTreeView({ sectors, onSave }: ServiceHierarchyTreeViewProps) {
  const [expandedSectors, setExpandedSectors] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);

  const toggleSector = (sectorId: string) => {
    setExpandedSectors(prev => 
      prev.includes(sectorId) 
        ? prev.filter(id => id !== sectorId)
        : [...prev, sectorId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  if (!sectors || sectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy Tree View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No service data available</p>
            <p className="text-sm text-gray-400">Import services using the Import tab to view the hierarchy</p>
          </div>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Service Hierarchy Tree View
          <div className="text-sm font-normal text-gray-500">
            {sectors.length} sectors • {totalCategories} categories • {totalServices} services
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sectors.map((sector) => (
            <div key={sector.id} className="border rounded-lg">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSector(sector.id)}
              >
                <div className="flex items-center space-x-2">
                  {expandedSectors.includes(sector.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <h3 className="font-semibold text-blue-600">{sector.name}</h3>
                  <span className="text-sm text-gray-500">
                    ({sector.categories.length} categories)
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {expandedSectors.includes(sector.id) && (
                <div className="border-t bg-gray-50/50 p-3">
                  {sector.description && (
                    <p className="text-sm text-gray-600 mb-3">{sector.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {sector.categories.map((category) => (
                      <div key={category.id} className="border rounded bg-white">
                        <div 
                          className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center space-x-2">
                            {expandedCategories.includes(category.id) ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                            <h4 className="font-medium text-green-600">{category.name}</h4>
                            <span className="text-xs text-gray-500">
                              ({category.subcategories.length} subcategories)
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {expandedCategories.includes(category.id) && (
                          <div className="border-t bg-gray-50/50 p-2">
                            {category.description && (
                              <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                            )}
                            
                            <div className="space-y-1">
                              {category.subcategories.map((subcategory) => (
                                <div key={subcategory.id} className="border rounded bg-white">
                                  <div 
                                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleSubcategory(subcategory.id)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {expandedSubcategories.includes(subcategory.id) ? (
                                        <ChevronDown className="h-3 w-3" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3" />
                                      )}
                                      <h5 className="font-medium text-purple-600">{subcategory.name}</h5>
                                      <span className="text-xs text-gray-500">
                                        ({subcategory.jobs.length} services)
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Button variant="ghost" size="sm">
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  {expandedSubcategories.includes(subcategory.id) && (
                                    <div className="border-t bg-gray-50/50 p-2">
                                      {subcategory.description && (
                                        <p className="text-xs text-gray-600 mb-2">{subcategory.description}</p>
                                      )}
                                      
                                      <div className="space-y-1">
                                        {subcategory.jobs.map((job) => (
                                          <div key={job.id} className="flex items-center justify-between p-2 bg-white border rounded">
                                            <div className="flex-1">
                                              <div className="font-medium text-sm">{job.name}</div>
                                              {job.description && (
                                                <div className="text-xs text-gray-500 mt-1">{job.description}</div>
                                              )}
                                              <div className="flex items-center gap-4 mt-1">
                                                {job.estimatedTime && (
                                                  <span className="text-xs text-blue-600">
                                                    ⏱ {job.estimatedTime} min
                                                  </span>
                                                )}
                                                {job.price && (
                                                  <span className="text-xs font-medium text-green-600">
                                                    💰 ${job.price}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <Button variant="ghost" size="sm">
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button variant="ghost" size="sm">
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
