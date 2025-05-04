
import React from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { formatTime } from '@/lib/services/serviceUtils';
import { Badge } from '@/components/ui/badge';
import type { CategoryColorStyle } from '../ServiceEditor';
import { DEFAULT_COLOR_STYLES } from '../ServiceEditor';

interface ServiceCategoryDetailsProps {
  category?: ServiceMainCategory;
  subcategory?: ServiceSubcategory;
  job?: ServiceJob;
  categoryColors: Record<string, number>;
  selectedColorIndex: number;
}

const ServiceCategoryDetails: React.FC<ServiceCategoryDetailsProps> = ({
  category,
  subcategory,
  job,
  categoryColors,
  selectedColorIndex
}) => {
  const getColorStyle = (categoryId: string): CategoryColorStyle => {
    const colorIndex = categoryColors[categoryId] || 0;
    return DEFAULT_COLOR_STYLES[colorIndex % DEFAULT_COLOR_STYLES.length];
  };

  if (!category) {
    return (
      <div className="text-center p-6 border rounded-lg bg-gray-50">
        <p className="text-gray-500">Select a service to view details</p>
      </div>
    );
  }

  const colorStyle = getColorStyle(category.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Service Details</h2>
      </div>

      {category && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className={`${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}>
              Category
            </Badge>
            <h3 className="text-lg font-medium">{category.name}</h3>
          </div>
          
          {category.description && (
            <p className="text-sm text-gray-600">{category.description}</p>
          )}
          
          <div className="text-xs text-gray-500">
            {category.subcategories.length} subcategories, 
            {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
          </div>
        </div>
      )}

      {subcategory && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Subcategory</Badge>
            <h3 className="text-md font-medium">{subcategory.name}</h3>
          </div>
          
          {subcategory.description && (
            <p className="text-sm text-gray-600">{subcategory.description}</p>
          )}
          
          <div className="text-xs text-gray-500">
            {subcategory.jobs.length} services
          </div>
        </div>
      )}

      {job && (
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Service</Badge>
            <h3 className="text-md font-medium">{job.name}</h3>
          </div>
          
          {job.description && (
            <p className="text-sm text-gray-600">{job.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Price</div>
              <div className="text-sm font-medium">${job.price?.toFixed(2) || '0.00'}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Estimated Time</div>
              <div className="text-sm font-medium">
                {job.estimatedTime ? formatTime(job.estimatedTime) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCategoryDetails;
