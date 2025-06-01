
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Edit2, Clock, DollarSign } from 'lucide-react';
import { SelectedService } from '@/types/selectedService';
import { formatEstimatedTime, formatPrice } from '@/lib/services/serviceUtils';

interface SelectedServiceCardProps {
  service: SelectedService;
  onRemove: (serviceId: string) => void;
  onEdit?: (serviceId: string) => void;
  isNew?: boolean;
}

export function SelectedServiceCard({ 
  service, 
  onRemove, 
  onEdit,
  isNew = false 
}: SelectedServiceCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(service.id), 150); // Allow animation to play
  };

  return (
    <Card 
      className={`transition-all duration-300 ${
        isNew ? 'animate-scale-in ring-2 ring-blue-500/20' : ''
      } ${
        isRemoving ? 'animate-scale-out opacity-0' : ''
      } hover:shadow-md`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm text-slate-900 truncate">
                {service.name}
              </h4>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleRemove}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {service.categoryName}
              </Badge>
              <span className="text-xs text-slate-400">→</span>
              <Badge variant="outline" className="text-xs">
                {service.subcategoryName}
              </Badge>
            </div>

            {service.description && (
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                {service.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-500">
              {service.estimatedTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatEstimatedTime(service.estimatedTime)}</span>
                </div>
              )}
              {service.price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{formatPrice(service.price)}</span>
                </div>
              )}
            </div>
          </div>

          {onEdit && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onEdit(service.id)}
              className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 ml-2"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
