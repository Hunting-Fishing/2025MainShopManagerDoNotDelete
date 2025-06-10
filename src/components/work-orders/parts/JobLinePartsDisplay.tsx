
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { WorkOrderPart, partStatusMap } from '@/types/workOrderPart';

interface JobLinePartsDisplayProps {
  parts: WorkOrderPart[];
  onRemovePart?: (partId: string) => void;
  onEditPart?: (part: WorkOrderPart) => void;
  isEditMode?: boolean;
}

export function JobLinePartsDisplay({
  parts,
  onRemovePart,
  onEditPart,
  isEditMode = false
}: JobLinePartsDisplayProps) {
  if (parts.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No parts added yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {parts.map((part) => (
        <Card key={part.id} className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-900">{part.partName}</h4>
                  {part.partNumber && (
                    <Badge variant="outline" className="text-xs">
                      {part.partNumber}
                    </Badge>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={partStatusMap[part.status]?.classes || 'bg-gray-100 text-gray-800'}
                  >
                    {partStatusMap[part.status]?.label || part.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Quantity:</span>
                    <div className="text-slate-900">{part.quantity}</div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Unit Price:</span>
                    <div className="text-slate-900">${part.customerPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Total:</span>
                    <div className="text-slate-900 font-medium">
                      ${(part.customerPrice * part.quantity).toFixed(2)}
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

                {part.notes && (
                  <div className="text-sm">
                    <span className="font-medium text-slate-600">Notes:</span>
                    <div className="text-slate-700 mt-1">{part.notes}</div>
                  </div>
                )}

                {part.warrantyDuration && (
                  <div className="text-sm">
                    <span className="font-medium text-slate-600">Warranty:</span>
                    <span className="ml-1 text-slate-900">{part.warrantyDuration}</span>
                  </div>
                )}

                {/* Physical Location */}
                {(part.warehouseLocation || part.shelfLocation || part.binLocation) && (
                  <div className="text-sm">
                    <span className="font-medium text-slate-600">Location:</span>
                    <span className="ml-1 text-slate-900">
                      {[part.warehouseLocation, part.shelfLocation, part.binLocation]
                        .filter(Boolean)
                        .join(' - ')}
                    </span>
                  </div>
                )}
              </div>

              {isEditMode && (
                <div className="flex items-center gap-2 ml-4">
                  {onEditPart && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditPart(part)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
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
      ))}
    </div>
  );
}
