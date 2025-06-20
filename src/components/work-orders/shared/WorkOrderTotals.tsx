
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';

interface WorkOrderTotalsProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
}

export function WorkOrderTotals({ jobLines, allParts }: WorkOrderTotalsProps) {
  const totalPartsValue = allParts.reduce((sum, part) => sum + part.total_price, 0);
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const subtotal = totalPartsValue + totalLaborCost;
  const taxRate = 0.08; // 8% tax rate
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-slate-600">Parts Subtotal:</span>
          <span className="font-medium">${totalPartsValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Labor Subtotal:</span>
          <span className="font-medium">${totalLaborCost.toFixed(2)}</span>
        </div>
        <hr className="border-slate-200" />
        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Tax (8%):</span>
          <span className="font-medium">${taxAmount.toFixed(2)}</span>
        </div>
        <hr className="border-slate-200" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
