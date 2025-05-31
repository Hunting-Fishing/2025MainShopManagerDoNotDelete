
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Plus } from 'lucide-react';
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob
} from '@/types/serviceHierarchy';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { generateServiceCode } from '@/utils/serviceCodeGenerator';

interface ServiceCategoriesViewProps {
  showSelectionMode?: boolean;
  onServiceSelect?: (service: ServiceJob, categoryName: string, subcategoryName: string, jobIndex: number) => void;
}

export const ServiceCategoriesView: React.FC<ServiceCategoriesViewProps> = ({
  showSelectionMode = false,
  onServiceSelect
}) => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const serviceCategories = await fetchServiceCategories();
        setCategories(serviceCategories);
        
        // Expand first category by default
        if (serviceCategories.length > 0) {
          setExpandedCategories(new Set([serviceCategories[0].id]));
        }
      } catch (error) {
        console.error('Failed to load service categories:', error);
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

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string, jobIndex: number) => {
    if (onServiceSelect) {
      onServiceSelect(service, categoryName, subcategoryName, jobIndex);
    }
  };

  const renderServiceJob = (job: ServiceJob, categoryName: string, subcategoryName: string, jobIndex: number) => {
    const serviceCode = generateServiceCode(categoryName, subcategoryName, jobIndex);
    
    return (
      <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Service Code and Name */}
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono text-xs">
                {serviceCode}
              </Badge>
              <h5 className="font-medium text-gray-900">{job.name}</h5>
            </div>
            
            {/* Description */}
            {job.description && (
              <p className="text-sm text-gray-600">{job.description}</p>
            )}
            
            {/* Service Details */}
            <div className="flex items-center space-x-4">
              {job.estimatedTime && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{job.estimatedTime} min</span>
                </Badge>
              )}
              {job.price && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${job.price.toFixed(2)}</span>
                </Badge>
              )}
            </div>
          </div>
          
          {/* Add Button */}
          {showSelectionMode && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="ml-4"
              onClick={() => handleServiceSelect(job, categoryName, subcategoryName, jobIndex)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderSubcategory = (subcategory: ServiceSubcategory, categoryName: string) => (
    <div key={subcategory.id} className="ml-4 space-y-3">
      <h4 className="font-medium text-gray-700 border-b pb-1">
        {subcategory.name}
      </h4>
      <div className="space-y-3">
        {subcategory.jobs.map((job, jobIndex) => 
          renderServiceJob(job, categoryName, subcategory.name, jobIndex)
        )}
      </div>
    </div>
  );

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

  return (
    <div className="space-y-4">
      {categories.map(category => (
        <Card key={category.id}>
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => toggleCategory(category.id)}
          >
            <CardTitle className="flex items-center justify-between">
              <span>{category.name}</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} Services
                </Badge>
                <span className="text-sm font-normal text-gray-500">
                  {expandedCategories.has(category.id) ? '−' : '+'}
                </span>
              </div>
            </CardTitle>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </CardHeader>
          
          {expandedCategories.has(category.id) && (
            <CardContent className="space-y-6">
              {category.subcategories.map(subcategory => 
                renderSubcategory(subcategory, category.name)
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
