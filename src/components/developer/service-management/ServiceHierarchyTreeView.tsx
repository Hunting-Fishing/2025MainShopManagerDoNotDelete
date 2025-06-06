
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Building, Database, FileText, Briefcase } from 'lucide-react';
import type { ServiceSector } from '@/types/serviceHierarchy';

interface ServiceHierarchyTreeViewProps {
  sectors: ServiceSector[];
  onSave?: (data: any) => void;
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

  const expandAll = () => {
    setExpandedSectors(new Set(sectors.map(s => s.id)));
    setExpandedCategories(new Set(sectors.flatMap(s => s.categories.map(c => c.id))));
    setExpandedSubcategories(new Set(sectors.flatMap(s => s.categories.flatMap(c => c.subcategories.map(sc => sc.id)))));
  };

  const collapseAll = () => {
    setExpandedSectors(new Set());
    setExpandedCategories(new Set());
    setExpandedSubcategories(new Set());
  };

  if (sectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Service Hierarchy Tree View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No service data found</div>
            <div className="text-xs">Import service data to view the hierarchy</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Service Hierarchy Tree View
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sectors.map((sector) => (
            <div key={sector.id} className="border rounded-lg">
              <div
                className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSector(sector.id)}
              >
                {expandedSectors.has(sector.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Building className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{sector.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {sector.categories.length} categories
                </span>
              </div>
              
              {expandedSectors.has(sector.id) && (
                <div className="pl-6 pb-2 space-y-1">
                  {sector.categories.map((category) => (
                    <div key={category.id} className="border-l-2 border-gray-200">
                      <div
                        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 ml-2"
                        onClick={() => toggleCategory(category.id)}
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                        <Database className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                          {category.subcategories.length} subcategories
                        </span>
                      </div>
                      
                      {expandedCategories.has(category.id) && (
                        <div className="pl-4 space-y-1">
                          {category.subcategories.map((subcategory) => (
                            <div key={subcategory.id} className="border-l-2 border-gray-100">
                              <div
                                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 ml-2"
                                onClick={() => toggleSubcategory(subcategory.id)}
                              >
                                {expandedSubcategories.has(subcategory.id) ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                                <FileText className="h-3 w-3 text-purple-600" />
                                <span className="text-sm">{subcategory.name}</span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                                  {subcategory.jobs.length} services
                                </span>
                              </div>
                              
                              {expandedSubcategories.has(subcategory.id) && (
                                <div className="pl-4 space-y-1">
                                  {subcategory.jobs.map((job) => (
                                    <div key={job.id} className="flex items-center gap-2 p-1.5 ml-2 text-sm">
                                      <Briefcase className="h-3 w-3 text-orange-600" />
                                      <span>{job.name}</span>
                                      {job.estimatedTime && (
                                        <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                                          {job.estimatedTime}min
                                        </span>
                                      )}
                                      {job.price && (
                                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                          ${job.price}
                                        </span>
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
