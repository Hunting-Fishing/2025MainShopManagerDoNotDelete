
import React, { useState } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Clock, DollarSign } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface HierarchicalServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

export function HierarchicalServiceSelector({ 
  categories, 
  onServiceSelect 
}: HierarchicalServiceSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

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

  const formatEstimatedTime = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <Card key={category.id} className="overflow-hidden">
          <Collapsible 
            open={expandedCategories.has(category.id)}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {category.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
                    </Badge>
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground text-left">
                    {category.description}
                  </p>
                )}
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                {category.subcategories.map((subcategory) => (
                  <Card key={subcategory.id} className="border-slate-200">
                    <Collapsible 
                      open={expandedSubcategories.has(subcategory.id)}
                      onOpenChange={() => toggleSubcategory(subcategory.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-slate-700">
                              {subcategory.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {subcategory.jobs.length} jobs
                              </Badge>
                              {expandedSubcategories.has(subcategory.id) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                          {subcategory.description && (
                            <p className="text-xs text-muted-foreground text-left">
                              {subcategory.description}
                            </p>
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-2">
                          {subcategory.jobs.map((job) => (
                            <div 
                              key={job.id}
                              className="border rounded-lg p-3 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-slate-900 mb-1">
                                    {job.name}
                                  </h4>
                                  {job.description && (
                                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                      {job.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    {job.estimatedTime && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatEstimatedTime(job.estimatedTime)}</span>
                                      </div>
                                    )}
                                    {job.price && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span>{formatPrice(job.price)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => onServiceSelect(job, category.name, subcategory.name)}
                                  className="ml-3"
                                >
                                  Select
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
}
