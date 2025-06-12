
import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, GripVertical } from 'lucide-react';
import { WorkOrderPart, partStatusMap } from '@/types/workOrderPart';
import { EditPartDialog } from './EditPartDialog';

interface DraggablePartCardProps {
  part: WorkOrderPart;
  onRemovePart?: (partId: string) => void;
  onEditPart?: (part: WorkOrderPart) => void;
  isEditMode?: boolean;
}

export function DraggablePartCard({
  part,
  onRemovePart,
  onEditPart,
  isEditMode = false
}: DraggablePartCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: part.id,
    data: {
      type: 'part',
      part,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleEditPart = (updatedPart: WorkOrderPart) => {
    if (onEditPart) {
      onEditPart(updatedPart);
    }
  };

  // Use proper field names and provide fallbacks
  const partName = part.name || part.partName || 'Unknown Part';
  const partNumber = part.part_number || part.partNumber || 'N/A';
  const unitPrice = part.unit_price || part.customerPrice || 0;
  const quantity = part.quantity || 0;
  const totalPrice = unitPrice * quantity;

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={`border-slate-200 ${isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''} ${isEditMode ? 'cursor-grab' : ''}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <div {...attributes} {...listeners} className="cursor-grab hover:text-primary">
                    <GripVertical className="h-4 w-4" />
                  </div>
                )}
                <h4 className="font-medium text-slate-900">{partName}</h4>
                {partNumber && partNumber !== 'N/A' && (
                  <Badge variant="outline" className="text-xs">
                    {partNumber}
                  </Badge>
                )}
                <Badge 
                  variant="secondary" 
                  className={partStatusMap[part.status || 'pending']?.classes || 'bg-gray-100 text-gray-800'}
                >
                  {partStatusMap[part.status || 'pending']?.label || part.status || 'Pending'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-600">Quantity:</span>
                  <div className="text-slate-900">{quantity}</div>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Unit Price:</span>
                  <div className="text-slate-900">${unitPrice.toFixed(2)}</div>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Total:</span>
                  <div className="text-slate-900 font-medium">
                    ${totalPrice.toFixed(2)}
                  </div>
                </div>
                {part.supplierName && (
                  <div>
                    <span className="font-medium text-slate-600">Supplier:</span>
                    <div className="text-slate-900">{part.supplierName}</div>
                  </div>
                )}
              </div>

              {part.category && (
                <div className="text-sm">
                  <span className="font-medium text-slate-600">Category:</span>
                  <span className="ml-1 text-slate-900">{part.category}</span>
                </div>
              )}

              {part.description && (
                <div className="text-sm">
                  <span className="font-medium text-slate-600">Description:</span>
                  <div className="text-slate-700 mt-1">{part.description}</div>
                </div>
              )}

              {part.notes && (
                <div className="text-sm">
                  <span className="font-medium text-slate-600">Notes:</span>
                  <div className="text-slate-700 mt-1">{part.notes}</div>
                </div>
              )}
            </div>

            {isEditMode && (
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {onRemovePart && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemovePart(part.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditPartDialog
        part={part}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={handleEditPart}
      />
    </>
  );
}
