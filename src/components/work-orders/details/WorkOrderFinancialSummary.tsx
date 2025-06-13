
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Wrench, Package } from 'lucide-react';

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
  const laborTotal = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const partsTotal = allParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
  const grandTotal = laborTotal + partsTotal;
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);

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
              <span className="text-sm text-muted-foreground">Est. Hours</span>
            </div>
            <p className="text-2xl font-bold">{totalEstimatedHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">total hours</p>
          </div>
          
          <div className="text-center border-l pl-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-3xl font-bold text-primary">${grandTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">grand total</p>
          </div>
        </div>
        
        {workOrder.tax_rate && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({(workOrder.tax_rate * 100).toFixed(1)}%):</span>
              <span>${(grandTotal * workOrder.tax_rate).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Total with Tax:</span>
              <span>${(grandTotal * (1 + workOrder.tax_rate)).toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
