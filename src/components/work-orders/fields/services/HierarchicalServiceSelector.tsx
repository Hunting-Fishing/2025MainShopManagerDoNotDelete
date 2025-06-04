
import React, { useState } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getCategoryColor } from '@/utils/categoryColors';
import { ChevronDown, ChevronRight, Search, Plus, Clock, DollarSign } from 'lucide-react';

interface HierarchicalServiceSelectorProps {
  categories: ServiceMainCategory[];
  selectedServices: SelectedService[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function HierarchicalServiceSelector({
  categories,
  selectedServices,
  onServiceSelect,
  onRemoveService,
  onUpdateServices
}: HierarchicalServiceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Filter categories based on search
  const filteredCategories = categories.map(category => {
    if (!searchTerm.trim()) return category;

    const filteredSubcategories = category.subcategories.map(subcategory => {
      const filteredJobs = subcategory.jobs.filter(job =>
        job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filteredJobs.length > 0 ? { ...subcategory, jobs: filteredJobs } : null;
    }).filter(Boolean);

    return filteredSubcategories.length > 0 ? 
      { ...category, subcategories: filteredSubcategories } : null;
  }).filter(Boolean);

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(selected => selected.serviceId === serviceId);
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

  // Auto-expand categories when searching
  React.useEffect(() => {
    if (searchTerm.trim()) {
      const categoriesToExpand = new Set(filteredCategories.map(cat => cat.id));
      const subcategoriesToExpand = new Set(
        filteredCategories.flatMap(cat => cat.subcategories.map(sub => sub.id))
      );
      setExpandedCategories(categoriesToExpand);
      setExpandedSubcategories(subcategoriesToExpand);
    }
  }, [searchTerm, filteredCategories]);

  console.log('🔍 HierarchicalServiceSelector:', {
    originalCategories: categories.length,
    filteredCategories: filteredCategories.length,
    selectedCount: selectedServices.length,
    searchTerm,
    totalJobs: filteredCategories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
    )
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search services, categories, or descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Stats */}
      {searchTerm && (
        <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
          Found {filteredCategories.reduce((sum, cat) => 
            sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
          )} services in {filteredCategories.length} categories
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {filteredCategories.map((category) => {
          const categoryColorClasses = getCategoryColor(category.name);
          const isExpanded = expandedCategories.has(category.id);

          return (
            <Card key={category.id} className="overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <Badge className={categoryColorClasses}>
                          {category.name}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {category.subcategories.reduce((sum, sub) => sum + sub.jobs.length, 0)} services
                        </span>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-2 ml-7">
                        {category.description}
                      </p>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="space-y-3">
                      {category.subcategories.map((subcategory) => {
                        const isSubExpanded = expandedSubcategories.has(subcategory.id);

                        return (
                          <div key={subcategory.id} className="border rounded-lg">
                            <Collapsible 
                              open={isSubExpanded} 
                              onOpenChange={() => toggleSubcategory(subcategory.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    {isSubExpanded ? (
                                      <ChevronDown className="h-3 w-3 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 text-gray-500" />
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {subcategory.name}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {subcategory.jobs.length} services
                                    </span>
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="px-3 pb-3 space-y-2">
                                  {subcategory.jobs.map((job) => {
                                    const isSelected = isServiceSelected(job.id);

                                    return (
                                      <div
                                        key={job.id}
                                        className={`p-3 border rounded-lg transition-all duration-200 ${
                                          isSelected 
                                            ? 'bg-blue-50 border-blue-200' 
                                            : 'hover:bg-gray-50 border-gray-200'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-gray-900 mb-1">
                                              {job.name}
                                            </h4>
                                            
                                            {job.description && (
                                              <p className="text-xs text-gray-600 mb-2">
                                                {job.description}
                                              </p>
                                            )}
                                            
                                            <div className="flex items-center gap-3">
                                              {job.estimatedTime && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                  <Clock className="h-3 w-3" />
                                                  <span>{job.estimatedTime} min</span>
                                                </div>
                                              )}
                                              {job.price && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                  <DollarSign className="h-3 w-3" />
                                                  <span>${job.price}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <Button
                                            size="sm"
                                            variant={isSelected ? "secondary" : "outline"}
                                            onClick={() => {
                                              if (isSelected) {
                                                const selectedService = selectedServices.find(s => s.serviceId === job.id);
                                                if (selectedService) {
                                                  onRemoveService(selectedService.id);
                                                }
                                              } else {
                                                onServiceSelect(job, category.name, subcategory.name);
                                              }
                                            }}
                                            className="ml-2 h-7 text-xs"
                                          >
                                            {isSelected ? (
                                              <>✓ Selected</>
                                            ) : (
                                              <>
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No services found matching your search' : 'No services available'}
        </div>
      )}
    </div>
  );
}
