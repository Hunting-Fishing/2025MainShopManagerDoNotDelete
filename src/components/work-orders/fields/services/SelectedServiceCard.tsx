
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SelectedService } from '@/types/selectedService';
import { getCategoryColor } from '@/utils/categoryColors';
import { X, Clock, DollarSign } from 'lucide-react';

interface SelectedServiceCardProps {
  service: SelectedService;
  onRemove: (serviceId: string) => void;
  isNew?: boolean;
}

export function SelectedServiceCard({ service, onRemove, isNew = false }: SelectedServiceCardProps) {
  const categoryColorClasses = getCategoryColor(service.categoryName);

  return (
    <Card className={`relative transition-all duration-300 ${
      isNew ? 'ring-2 ring-blue-500 ring-opacity-50 animate-pulse' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Category and Subcategory */}
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${categoryColorClasses} text-xs`}>
                {service.categoryName}
              </Badge>
              <span className="text-xs text-gray-500">→</span>
              <Badge variant="outline" className="text-xs">
                {service.subcategoryName}
              </Badge>
            </div>
            
            {/* Service Name */}
            <h4 className="font-medium text-sm text-gray-900 mb-1">
              {service.name}
            </h4>
            
            {/* Description */}
            {service.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {service.description}
              </p>
            )}
            
            {/* Time and Price */}
            <div className="flex items-center gap-3">
              {service.estimatedTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{service.estimatedTime} min</span>
                </div>
              )}
              {service.price && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <DollarSign className="h-3 w-3" />
                  <span>${service.price}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Remove Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(service.id)}
            className="ml-2 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
