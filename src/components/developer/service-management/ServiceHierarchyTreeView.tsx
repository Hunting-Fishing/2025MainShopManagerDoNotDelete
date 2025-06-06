
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Building, FolderOpen, Briefcase, Wrench } from 'lucide-react';
import { ServiceSector } from '@/types/serviceHierarchy';

interface ServiceHierarchyTreeViewProps {
  sectors: ServiceSector[];
  onSave?: (data: any) => void;
}

export function ServiceHierarchyTreeView({ sectors, onSave }: ServiceHierarchyTreeViewProps) {
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  const toggleSectorExpanded = (sectorId: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sectorId)) {
      newExpanded.delete(sectorId);
    } else {
      newExpanded.add(sectorId);
    }
    setExpandedSectors(newExpanded);
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategoryExpanded = (subcategoryId: string) => {
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
    setExpandedSubcategories(new Set(sectors.flatMap(s => 
      s.categories.flatMap(c => c.subcategories.map(sc => sc.id))
    )));
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
          <CardTitle>Service Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No service sectors found</p>
            <p className="text-sm">Import services to populate the hierarchy</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Service Hierarchy Tree</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sectors.map((sector) => {
            const isExpanded = expandedSectors.has(sector.id);
            const totalCategories = sector.categories.length;
            const totalSubcategories = sector.categories.reduce((acc, cat) => acc + cat.subcategories.length, 0);
            const totalJobs = sector.categories.reduce((acc, cat) => 
              acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.jobs.length, 0), 0);

            return (
              <Collapsible key={sector.id} open={isExpanded} onOpenChange={() => toggleSectorExpanded(sector.id)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-blue-50 p-3 h-auto"
                  >
                    <div className="flex items-center space-x-2 w-full">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <Building className="h-5 w-5 text-blue-600" />
                      <div className="flex-1 text-left">
                        <span className="font-semibold text-blue-900">{sector.name}</span>
                        {sector.description && (
                          <p className="text-sm text-gray-600 mt-1">{sector.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {totalCategories} categories
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {totalJobs} services
                        </Badge>
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4">
                  <div className="space-y-1 mt-2">
                    {sector.categories.map((category) => {
                      const isCategoryExpanded = expandedCategories.has(category.id);
                      const categoryJobs = category.subcategories.reduce((acc, sub) => acc + sub.jobs.length, 0);

                      return (
                        <Collapsible key={category.id} open={isCategoryExpanded} onOpenChange={() => toggleCategoryExpanded(category.id)}>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start hover:bg-green-50 p-2 h-auto"
                            >
                              <div className="flex items-center space-x-2 w-full">
                                {isCategoryExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                <FolderOpen className="h-4 w-4 text-green-600" />
                                <div className="flex-1 text-left">
                                  <span className="font-medium text-green-900">{category.name}</span>
                                  {category.description && (
                                    <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                                  )}
                                </div>
                                <div className="flex space-x-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {category.subcategories.length} subcategories
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {categoryJobs} services
                                  </Badge>
                                </div>
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="ml-4">
                            <div className="space-y-1 mt-1">
                              {category.subcategories.map((subcategory) => {
                                const isSubcategoryExpanded = expandedSubcategories.has(subcategory.id);

                                return (
                                  <Collapsible key={subcategory.id} open={isSubcategoryExpanded} onOpenChange={() => toggleSubcategoryExpanded(subcategory.id)}>
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start hover:bg-purple-50 p-2 h-auto"
                                      >
                                        <div className="flex items-center space-x-2 w-full">
                                          {isSubcategoryExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                          <Briefcase className="h-4 w-4 text-purple-600" />
                                          <div className="flex-1 text-left">
                                            <span className="font-medium text-purple-900">{subcategory.name}</span>
                                            {subcategory.description && (
                                              <p className="text-xs text-gray-600 mt-1">{subcategory.description}</p>
                                            )}
                                          </div>
                                          <Badge variant="outline" className="text-xs">
                                            {subcategory.jobs.length} services
                                          </Badge>
                                        </div>
                                      </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="ml-4">
                                      <div className="space-y-1 mt-1">
                                        {subcategory.jobs.length === 0 ? (
                                          <div className="text-xs text-gray-500 p-2">No services found</div>
                                        ) : (
                                          subcategory.jobs.map((job) => (
                                            <div key={job.id} className="flex items-center space-x-2 p-2 hover:bg-orange-50 rounded">
                                              <Wrench className="h-3 w-3 text-orange-600" />
                                              <div className="flex-1">
                                                <span className="text-sm font-medium text-orange-900">{job.name}</span>
                                                {job.description && (
                                                  <p className="text-xs text-gray-600">{job.description}</p>
                                                )}
                                                <div className="flex space-x-2 mt-1">
                                                  {job.estimatedTime && (
                                                    <span className="text-xs text-gray-500">⏱️ {job.estimatedTime}min</span>
                                                  )}
                                                  {job.price && (
                                                    <span className="text-xs text-gray-500">💰 ${job.price}</span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
