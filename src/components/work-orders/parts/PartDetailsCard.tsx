
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkOrderPart, partStatusMap } from '@/types/workOrderPart';
import { Trash2, Edit, Package, DollarSign, Calendar, Wrench } from 'lucide-react';

interface PartDetailsCardProps {
  part: WorkOrderPart;
  onRemove?: (partId: string) => void;
  onEdit?: (part: WorkOrderPart) => void;
  isEditMode?: boolean;
}

export function PartDetailsCard({ 
  part, 
  onRemove, 
  onEdit, 
  isEditMode = false 
}: PartDetailsCardProps) {
  const totalPrice = part.customerPrice * part.quantity;
  const totalCost = part.supplierCost * part.quantity;
  const markup = totalPrice - totalCost;
  const markupPercentage = totalCost > 0 ? ((markup / totalCost) * 100) : 0;

  return (
    <Card className="border-slate-200 hover:border-slate-300 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-slate-900">{part.partName}</h4>
              <Badge 
                variant="outline" 
                className={partStatusMap[part.status]?.classes || ''}
              >
                {partStatusMap[part.status]?.label || part.status}
              </Badge>
            </div>
            
            {part.partNumber && (
              <p className="text-sm text-slate-600 mb-1">
                Part #: {part.partNumber}
              </p>
            )}
            
            {part.supplierName && (
              <p className="text-sm text-slate-600 mb-2">
                Supplier: {part.supplierName}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Quantity:</span>
                <span className="ml-1 font-medium">{part.quantity}</span>
              </div>
              <div>
                <span className="text-slate-500">Unit Price:</span>
                <span className="ml-1 font-medium">${part.customerPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Total:</span>
                <span className="ml-1 font-medium text-green-600">${totalPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Markup:</span>
                <span className="ml-1 font-medium text-purple-600">
                  ${markup.toFixed(2)} ({markupPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>

            {part.category && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {part.category}
                </Badge>
              </div>
            )}

            {part.installDate && (
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                Installed: {new Date(part.installDate).toLocaleDateString()}
              </div>
            )}

            {part.warrantyDuration && (
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Wrench className="h-3 w-3" />
                Warranty: {part.warrantyDuration}
              </div>
            )}

            {part.notes && (
              <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600">
                {part.notes}
              </div>
            )}
          </div>

          {isEditMode && (
            <div className="flex flex-col gap-1 ml-3">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(part)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(part.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
