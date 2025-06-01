
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ServiceMainCategory, ServiceJob } from "@/types/serviceHierarchy";
import { SelectedService } from "@/types/selectedService";
import { Search, Package, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface IntegratedServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: SelectedService[];
  onRemoveService?: (serviceId: string) => void;
  onUpdateServices?: (services: SelectedService[]) => void;
  maxSelections?: number;
}

export const IntegratedServiceSelector: React.FC<IntegratedServiceSelectorProps> = ({
  categories,
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices,
  maxSelections
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Search functionality
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    return categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        jobs: subcategory.jobs.filter(job =>
          job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(subcategory => subcategory.jobs.length > 0)
    })).filter(category => category.subcategories.length > 0);
  }, [categories, searchTerm]);

  // Auto-expand categories when searching
  React.useEffect(() => {
    if (searchTerm.trim()) {
      const categoryIds = filteredCategories.map(cat => cat.id);
      setExpandedCategories(new Set(categoryIds));
    }
  }, [searchTerm, filteredCategories]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    // Check max selections limit
    if (maxSelections && selectedServices.length >= maxSelections) {
      return;
    }

    // Check if service is already selected
    const isAlreadySelected = selectedServices.some(s => s.serviceId === service.id);
    if (isAlreadySelected) {
      return;
    }

    onServiceSelect(service, categoryName, subcategoryName);
  };

  const handleRemoveService = (serviceId: string) => {
    if (onRemoveService) {
      onRemoveService(serviceId);
    }
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="text-sm font-medium mb-2">Selected Services</h4>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((service) => (
                <Badge key={service.id} variant="secondary" className="flex items-center gap-1">
                  {service.name}
                  {onRemoveService && (
                    <button
                      onClick={() => handleRemoveService(service.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {maxSelections && (
              <p className="text-xs text-muted-foreground mt-2">
                {selectedServices.length} of {maxSelections} services selected
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Categories */}
      <div className="space-y-2">
        {filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {searchTerm ? "No services found" : "No services available"}
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                {searchTerm 
                  ? `No services match "${searchTerm}". Try a different search term.`
                  : "Contact your administrator to set up services"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
                    </Badge>
                  </div>
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {expandedCategories.has(category.id) && (
                  <div className="px-4 pb-4 space-y-3">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground px-2">
                          {subcategory.name}
                        </h4>
                        <div className="grid gap-2">
                          {subcategory.jobs.map((job) => {
                            const isSelected = isServiceSelected(job.id);
                            const isDisabled = maxSelections && selectedServices.length >= maxSelections && !isSelected;
                            
                            return (
                              <Button
                                key={job.id}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleServiceSelect(job, category.name, subcategory.name)}
                                disabled={isDisabled || isSelected}
                                className="justify-start h-auto p-3"
                              >
                                <div className="flex flex-col items-start w-full">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{job.name}</span>
                                    {job.price && (
                                      <span className="text-sm text-muted-foreground">
                                        ${job.price}
                                      </span>
                                    )}
                                  </div>
                                  {job.description && (
                                    <span className="text-xs text-muted-foreground text-left">
                                      {job.description}
                                    </span>
                                  )}
                                  {job.estimatedTime && (
                                    <span className="text-xs text-muted-foreground">
                                      Est. {job.estimatedTime} min
                                    </span>
                                  )}
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
