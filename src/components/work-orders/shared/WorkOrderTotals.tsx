
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface WorkOrderTotalsProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
}

export function WorkOrderTotals({ jobLines, allParts }: WorkOrderTotalsProps) {
  // Calculate totals
  const laborTotal = jobLines.reduce((sum, line) => {
    return sum + (line.total_amount || ((line.estimated_hours || 0) * (line.labor_rate || 0)));
  }, 0);
  
  const partsTotal = allParts.reduce((sum, part) => {
    return sum + (part.quantity * part.unit_price);
  }, 0);
  
  const coreChargeTotal = allParts.reduce((sum, part) => {
    return sum + (part.coreChargeApplied ? (part.coreChargeAmount || 0) : 0);
  }, 0);
  
  const totalHours = jobLines.reduce((sum, line) => {
    return sum + (line.estimated_hours || 0);
  }, 0);
  
  const subtotal = laborTotal + partsTotal + coreChargeTotal;
  const taxableAmount = allParts
    .filter(part => part.isTaxable)
    .reduce((sum, part) => sum + (part.quantity * part.unit_price), 0);
  
  // Assuming 8% tax rate for demo - this should come from settings
  const taxRate = 0.08;
  const taxAmount = taxableAmount * taxRate;
  const grandTotal = subtotal + taxAmount;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Work Order Totals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Hours:</span>
            <span className="font-medium">{totalHours}h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Labor ({jobLines.length} items):</span>
            <span className="font-medium">${laborTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Parts ({allParts.length} items):</span>
            <span className="font-medium">${partsTotal.toFixed(2)}</span>
          </div>
          {coreChargeTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span>Core Charges:</span>
              <span className="font-medium">${coreChargeTotal.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        {taxableAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span>Tax ({(taxRate * 100).toFixed(1)}% on ${taxableAmount.toFixed(2)}):</span>
            <span className="font-medium">${taxAmount.toFixed(2)}</span>
          </div>
        )}
        
        <Separator />
        
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
