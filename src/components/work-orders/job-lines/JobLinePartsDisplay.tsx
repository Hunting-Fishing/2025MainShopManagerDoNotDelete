
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Eye } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';

interface JobLinePartsDisplayProps {
  parts: WorkOrderPart[];
  onViewPart?: (part: WorkOrderPart) => void;
  isEditMode?: boolean;
}

export function JobLinePartsDisplay({ parts, onViewPart, isEditMode = false }: JobLinePartsDisplayProps) {
  if (!parts || parts.length === 0) {
    return null;
  }

  const totalPartsValue = parts.reduce((total, part) => total + (part.customerPrice * part.quantity), 0);

  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="font-medium text-sm">Parts ({parts.length})</span>
          <Badge variant="outline" className="text-green-600">
            ${totalPartsValue.toFixed(2)}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        {parts.map((part) => (
          <div key={part.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{part.partName}</span>
                <Badge variant="outline" className="text-xs">
                  {part.partType}
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <span>Qty: {part.quantity}</span>
                <span className="ml-4">Price: ${part.customerPrice.toFixed(2)}</span>
                <span className="ml-4">Total: ${(part.quantity * part.customerPrice).toFixed(2)}</span>
              </div>
            </div>
            
            {onViewPart && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewPart(part)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
