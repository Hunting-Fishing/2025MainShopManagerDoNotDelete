
import React from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash, Edit } from 'lucide-react';
import { partStatusMap } from '@/types/workOrderPart';

interface PartDetailsCardProps {
  part: WorkOrderPart;
  onRemove: (partId: string) => void;
  isEditMode?: boolean;
}

export function PartDetailsCard({ 
  part, 
  onRemove, 
  isEditMode = false 
}: PartDetailsCardProps) {
  const statusInfo = partStatusMap[part.status || 'pending'];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium">{part.name}</h4>
              <Badge className={statusInfo.classes}>
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Part #:</span> {part.part_number}
              </div>
              <div>
                <span className="font-medium">Quantity:</span> {part.quantity}
              </div>
              <div>
                <span className="font-medium">Unit Price:</span> ${part.unit_price.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Total:</span> ${part.total_price.toFixed(2)}
              </div>
            </div>
            
            {part.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {part.description}
              </p>
            )}
            
            {part.notes && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Notes:</span> {part.notes}
              </p>
            )}
          </div>
          
          {isEditMode && (
            <div className="flex gap-1 ml-4">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemove(part.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
