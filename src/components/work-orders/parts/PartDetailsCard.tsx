
import React from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package } from 'lucide-react';

interface PartDetailsCardProps {
  part: WorkOrderPart;
  onUpdate?: (updatedPart: WorkOrderPart) => void;
  onRemove?: (partId: string) => void;
  isEditMode?: boolean;
  compact?: boolean;
}

export function PartDetailsCard({ 
  part, 
  onUpdate, 
  onRemove, 
  isEditMode = false,
  compact = false 
}: PartDetailsCardProps) {
  // Use proper field names and provide fallbacks
  const partName = part.name || part.partName || 'Unknown Part';
  const partNumber = part.part_number || part.partNumber || 'N/A';
  const unitPrice = part.unit_price || part.customerPrice || 0;
  const quantity = part.quantity || 0;
  const totalPrice = unitPrice * quantity;

  if (compact) {
    return (
      <Card className="p-3 border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{partName}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Part #: {partNumber} | Qty: {quantity} | Unit: ${unitPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">${totalPrice.toFixed(2)}</div>
            {part.status && (
              <Badge variant="outline" className="text-xs mt-1">
                {part.status}
              </Badge>
            )}
            {isEditMode && (
              <div className="flex gap-1 mt-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => onRemove?.(part.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">{partName}</h3>
              {part.status && (
                <Badge variant="outline" className="text-xs">
                  {part.status}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Part Number:</span>
                <p className="font-medium">{partNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Quantity:</span>
                <p className="font-medium">{quantity}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Unit Price:</span>
                <p className="font-medium">${unitPrice.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <p className="font-medium">${totalPrice.toFixed(2)}</p>
              </div>
            </div>

            {part.description && (
              <div className="mt-2">
                <span className="text-muted-foreground text-sm">Description:</span>
                <p className="text-sm mt-1">{part.description}</p>
              </div>
            )}

            {part.notes && (
              <div className="mt-2">
                <span className="text-muted-foreground text-sm">Notes:</span>
                <p className="text-sm mt-1">{part.notes}</p>
              </div>
            )}
          </div>

          {isEditMode && (
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRemove?.(part.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
