
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Building2, FolderOpen, FileText, Plus } from 'lucide-react';
import { ServiceSector } from '@/types/serviceHierarchy';

interface ServiceHierarchyTreeViewProps {
  sectors: ServiceSector[];
  onSave: (data: any) => void;
}

export function ServiceHierarchyTreeView({ sectors, onSave }: ServiceHierarchyTreeViewProps) {
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  const toggleSector = (sectorId: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sectorId)) {
      newExpanded.delete(sectorId);
    } else {
      newExpanded.add(sectorId);
    }
    setExpandedSectors(newExpanded);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  if (sectors.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No service sectors found</p>
            <p className="text-sm text-gray-400">Import services to populate the hierarchy</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Service Hierarchy Tree</span>
          <Badge variant="outline">{sectors.length} sectors</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sectors.map((sector) => (
            <div key={sector.id} className="border rounded-lg">
              <div 
                className="flex items-center p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSector(sector.id)}
              >
                {expandedSectors.has(sector.id) ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">{sector.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {sector.categories.length} categories
                </Badge>
              </div>
              
              {expandedSectors.has(sector.id) && (
                <div className="pl-6 pb-3">
                  {sector.categories.map((category) => (
                    <div key={category.id} className="border-l-2 border-gray-200 ml-3">
                      <div 
                        className="flex items-center p-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleCategory(category.id)}
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <FolderOpen className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {category.subcategories.length} subcategories
                        </Badge>
                      </div>
                      
                      {expandedCategories.has(category.id) && (
                        <div className="pl-6">
                          {category.subcategories.map((subcategory) => (
                            <div key={subcategory.id} className="border-l-2 border-gray-200 ml-3">
                              <div 
                                className="flex items-center p-2 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleSubcategory(subcategory.id)}
                              >
                                {expandedSubcategories.has(subcategory.id) ? (
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 mr-2" />
                                )}
                                <FileText className="h-4 w-4 mr-2 text-purple-600" />
                                <span>{subcategory.name}</span>
                                <Badge variant="outline" className="ml-auto">
                                  {subcategory.jobs.length} jobs
                                </Badge>
                              </div>
                              
                              {expandedSubcategories.has(subcategory.id) && (
                                <div className="pl-6 space-y-1">
                                  {subcategory.jobs.map((job) => (
                                    <div key={job.id} className="flex items-center p-2 text-sm bg-gray-50 rounded">
                                      <span className="flex-1">{job.name}</span>
                                      {job.estimatedTime && (
                                        <Badge variant="outline" className="text-xs mr-2">
                                          {job.estimatedTime}min
                                        </Badge>
                                      )}
                                      {job.price && (
                                        <Badge variant="outline" className="text-xs">
                                          ${job.price}
                                        </Badge>
                                      )}
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
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
