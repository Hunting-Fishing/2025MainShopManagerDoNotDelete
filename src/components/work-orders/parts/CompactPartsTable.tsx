
import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';

interface CompactPartsTableProps {
  parts: WorkOrderPart[];
  onUpdate: (updatedPart: WorkOrderPart) => void;
  onDelete: (partId: string) => void;
  isEditMode: boolean;
}

export function CompactPartsTable({
  parts,
  onUpdate,
  onDelete,
  isEditMode
}: CompactPartsTableProps) {
  const handleEditClick = (part: WorkOrderPart) => {
    console.log('Edit part clicked:', part.id, part.name);
    // TODO: Implement part edit dialog
  };

  const handleDeleteClick = (partId: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      onDelete(partId);
    }
  };

  if (parts.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No parts found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {parts.map((part) => (
        <div key={part.id} className="flex items-center justify-between p-2 border rounded text-sm">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{part.name}</span>
              <Badge variant="outline" className="text-xs">
                Qty: {part.quantity}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              ${part.unit_price} × {part.quantity} = ${part.total_price}
            </div>
          </div>
          {isEditMode && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditClick(part)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(part.id)}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
