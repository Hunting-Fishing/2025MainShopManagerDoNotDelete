
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, TrendingUp } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';

interface ViewPartDetailsDialogProps {
  part: WorkOrderPart;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPartDetailsDialog({ part, open, onOpenChange }: ViewPartDetailsDialogProps) {
  const totalCost = part.quantity * part.customerPrice;
  const markup = part.customerPrice - part.supplierCost;
  const markupAmount = markup * part.quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Part Details: {part.partName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Part Name</label>
                  <p className="font-medium">{part.partName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Part Type</label>
                  <div>
                    <Badge variant={part.partType === 'inventory' ? 'default' : 'secondary'}>
                      {part.partType}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {part.partNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Part Number</label>
                  <p className="font-medium">{part.partNumber}</p>
                </div>
              )}
              
              {part.supplierName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                  <p className="font-medium">{part.supplierName}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className="font-medium">{part.quantity}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier Cost (each)</label>
                  <p className="font-medium">${part.supplierCost.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Retail Price (each)</label>
                  <p className="font-medium">${part.retailPrice.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Markup Percentage</label>
                  <p className="font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    {part.markupPercentage.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Price (each)</label>
                  <p className="font-medium text-green-600">${part.customerPrice.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                    <p className="text-lg font-bold">${totalCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Markup</label>
                    <p className="text-lg font-bold text-green-600">+${markupAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {part.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{part.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
