
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Clock, DollarSign, Plus } from "lucide-react";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { fetchServiceCategories } from "@/lib/services/serviceApi";

interface ServiceCategoriesViewProps {
  onServiceSelect?: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: string[];
  showSelectionMode?: boolean;
}

export const ServiceCategoriesView: React.FC<ServiceCategoriesViewProps> = ({
  onServiceSelect,
  selectedServices = [],
  showSelectionMode = false
}) => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const serviceCategories = await fetchServiceCategories();
        setCategories(serviceCategories);
        
        // Expand first category by default
        if (serviceCategories.length > 0) {
          setExpandedCategories(new Set([serviceCategories[0].id]));
        }
      } catch (err) {
        console.error("Failed to load service categories:", err);
        setError("Failed to load service categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

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

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    if (onServiceSelect) {
      onServiceSelect(service, categoryName, subcategoryName);
    }
  };

  const renderServiceJob = (job: ServiceJob, categoryName: string, subcategoryName: string) => {
    const isSelected = selectedServices.includes(job.id);
    
    return (
      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h5 className="font-medium">{job.name}</h5>
            {isSelected && <Badge variant="default" className="text-xs">Selected</Badge>}
          </div>
          {job.description && (
            <p className="text-sm text-gray-600 mt-1">{job.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-2">
            {job.estimatedTime && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{job.estimatedTime} min</span>
              </Badge>
            )}
            {job.price && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>${job.price}</span>
              </Badge>
            )}
          </div>
        </div>
        {showSelectionMode && (
          <Button
            type="button"
            size="sm"
            variant={isSelected ? "secondary" : "outline"}
            onClick={() => handleServiceSelect(job, categoryName, subcategoryName)}
            className="ml-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  const renderSubcategory = (subcategory: ServiceSubcategory, categoryName: string) => {
    const isExpanded = expandedSubcategories.has(subcategory.id);
    
    return (
      <div key={subcategory.id} className="ml-4 border-l border-gray-200 pl-4">
        <div
          className="flex items-center space-x-2 py-2 cursor-pointer hover:bg-gray-50 rounded px-2"
          onClick={() => toggleSubcategory(subcategory.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <h4 className="font-medium text-gray-700">{subcategory.name}</h4>
          <Badge variant="secondary" className="text-xs">
            {subcategory.jobs.length} services
          </Badge>
        </div>
        
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {subcategory.jobs.map(job => renderServiceJob(job, categoryName, subcategory.name))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2].map(j => (
                  <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map(category => {
        const isExpanded = expandedCategories.has(category.id);
        
        return (
          <Card key={category.id}>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <span>{category.name}</span>
                  <Badge variant="secondary">
                    {category.subcategories.length} subcategories
                  </Badge>
                </div>
              </CardTitle>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="space-y-4">
                {category.subcategories.map(subcategory => 
                  renderSubcategory(subcategory, category.name)
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
