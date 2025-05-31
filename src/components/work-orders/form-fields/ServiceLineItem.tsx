
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, X } from 'lucide-react';

export interface ServiceLineItemData {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryName: string;
  subcategoryName: string;
  estimatedTime?: number;
  price?: number;
  quantity: number;
  total: number;
}

interface ServiceLineItemProps {
  service: ServiceLineItemData;
  onRemove?: (serviceId: string) => void;
  onQuantityChange?: (serviceId: string, quantity: number) => void;
  showActions?: boolean;
}

export const ServiceLineItem: React.FC<ServiceLineItemProps> = ({
  service,
  onRemove,
  onQuantityChange,
  showActions = true
}) => {
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, service.quantity + delta);
    onQuantityChange?.(service.id, newQuantity);
  };

  return (
    <Card className="p-4 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* Service Code and Name */}
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono text-xs">
              {service.code}
            </Badge>
            <h4 className="font-semibold text-gray-900">{service.name}</h4>
          </div>

          {/* Category Path */}
          <div className="text-sm text-gray-600">
            {service.categoryName} → {service.subcategoryName}
          </div>

          {/* Description */}
          {service.description && (
            <p className="text-sm text-gray-700">{service.description}</p>
          )}

          {/* Service Details */}
          <div className="flex items-center space-x-4">
            {service.estimatedTime && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{service.estimatedTime} min</span>
              </div>
            )}
            
            {service.price && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <DollarSign className="h-3 w-3" />
                <span>${service.price.toFixed(2)}</span>
              </div>
            )}

            {showActions && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Qty:</span>
                <div className="flex items-center space-x-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={service.quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm">{service.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions and Total */}
        <div className="flex items-start space-x-3">
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              ${service.total.toFixed(2)}
            </div>
            {service.quantity > 1 && (
              <div className="text-xs text-gray-500">
                ${service.price?.toFixed(2)} × {service.quantity}
              </div>
            )}
          </div>
          
          {showActions && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={() => onRemove(service.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
