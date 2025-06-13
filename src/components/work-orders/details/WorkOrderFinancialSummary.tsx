
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Wrench, Package, Calculator } from 'lucide-react';

interface WorkOrderFinancialSummaryProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
}

export function WorkOrderFinancialSummary({
  workOrder,
  jobLines,
  allParts
}: WorkOrderFinancialSummaryProps) {
  // Calculate totals with proper field mapping
  const laborTotal = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const partsTotal = allParts.reduce((sum, part) => {
    // Use total_price if available, otherwise calculate from unit_price and quantity
    const partTotal = part.total_price || ((part.unit_price || 0) * (part.quantity || 1));
    return sum + partTotal;
  }, 0);
  const subtotal = laborTotal + partsTotal;
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);

  // Tax calculation
  const taxRate = workOrder.tax_rate || 0;
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Labor</span>
            </div>
            <p className="text-2xl font-bold">${laborTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{jobLines.length} job lines</p>
            <p className="text-xs text-muted-foreground">{totalEstimatedHours.toFixed(1)} hours</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Parts</span>
            </div>
            <p className="text-2xl font-bold">${partsTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{allParts.length} parts</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-muted-foreground">Subtotal</span>
            </div>
            <p className="text-2xl font-bold">${subtotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">before tax</p>
          </div>
          
          <div className="text-center border-l pl-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Grand Total</span>
            </div>
            <p className="text-3xl font-bold text-primary">${grandTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              {taxRate > 0 ? `incl. ${(taxRate * 100).toFixed(1)}% tax` : 'no tax'}
            </p>
          </div>
        </div>
        
        {/* Detailed breakdown if tax is applied */}
        {taxRate > 0 && (
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span>Labor:</span>
              <span>${laborTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Parts:</span>
              <span>${partsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t pt-2">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <p className="text-muted-foreground">Avg Labor Rate</p>
            <p className="font-medium">
              ${totalEstimatedHours > 0 ? (laborTotal / totalEstimatedHours).toFixed(0) : '0'}/hr
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Part Cost</p>
            <p className="font-medium">
              ${allParts.length > 0 ? (partsTotal / allParts.length).toFixed(2) : '0.00'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Labor %</p>
            <p className="font-medium">
              {subtotal > 0 ? ((laborTotal / subtotal) * 100).toFixed(1) : '0'}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Parts %</p>
            <p className="font-medium">
              {subtotal > 0 ? ((partsTotal / subtotal) * 100).toFixed(1) : '0'}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
