
import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash, Edit, Package, DollarSign } from 'lucide-react';
import { partStatusMap } from '@/types/workOrderPart';
import { EditPartDialog } from './EditPartDialog';

interface PartDetailsCardProps {
  part: WorkOrderPart;
  onRemove: (partId: string) => void;
  onUpdate?: (updatedPart: WorkOrderPart) => void;
  isEditMode?: boolean;
  compact?: boolean;
}

export function PartDetailsCard({ 
  part, 
  onRemove, 
  onUpdate,
  isEditMode = false,
  compact = false
}: PartDetailsCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const statusInfo = partStatusMap[part.status || 'pending'];

  // Ensure we have proper numeric values and calculate total
  const quantity = Number(part.quantity) || 1;
  const unitPrice = Number(part.unit_price) || 0;
  const calculatedTotal = quantity * unitPrice;
  const displayTotal = part.total_price || calculatedTotal;

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleSavePart = (updatedPart: WorkOrderPart) => {
    if (onUpdate) {
      onUpdate(updatedPart);
    }
  };

  if (compact) {
    return (
      <>
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-sm">{part.name}</p>
              <p className="text-xs text-muted-foreground">{part.part_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm">Qty: {quantity}</p>
              <p className="text-sm font-medium">${displayTotal.toFixed(2)}</p>
            </div>
            <Badge className={`${statusInfo.classes} text-xs`}>
              {statusInfo.label}
            </Badge>
            {isEditMode && (
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleEditClick}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemove(part.id)}
                  className="h-6 w-6 p-0 text-red-600"
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <EditPartDialog
          part={part}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSavePart}
        />
      </>
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold text-lg">{part.name}</h4>
                </div>
                <Badge className={`${statusInfo.classes} font-medium`}>
                  {statusInfo.label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Part Number:</span>
                    <span className="font-medium">{part.part_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Price:</span>
                    <span className="font-medium">${unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-lg flex items-center gap-1 text-green-600">
                      <DollarSign className="h-4 w-4" />
                      {displayTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {part.description && (
                <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Description:</span> {part.description}
                  </p>
                </div>
              )}
              
              {part.notes && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <span className="font-medium">Notes:</span> {part.notes}
                  </p>
                </div>
              )}
            </div>
            
            {isEditMode && (
              <div className="flex gap-2 ml-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleEditClick}
                  className="hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemove(part.id)}
                  className="hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditPartDialog
        part={part}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSavePart}
      />
    </>
  );
}
