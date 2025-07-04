
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Calculator, DollarSign, TrendingUp, Receipt } from 'lucide-react';

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

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <Card className="modern-card gradient-border group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4 bg-gradient-subtle rounded-t-lg">
        <CardTitle className="section-title flex items-center gap-3 font-heading text-foreground">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 backdrop-blur-sm">
        {/* Parts & Labor Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-subtle border hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground font-body">Parts Subtotal:</span>
            </div>
            <span className="font-semibold text-foreground font-body">{formatCurrency(totalPartsValue)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-subtle border hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground font-body">Labor Subtotal:</span>
            </div>
            <span className="font-semibold text-foreground font-body">{formatCurrency(totalLaborCost)}</span>
          </div>
        </div>

        <div className="border-t border-muted/30 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground font-body">Subtotal:</span>
            <span className="font-semibold text-foreground font-body">{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground font-body">Tax (8%):</span>
            <span className="font-semibold text-foreground font-body">{formatCurrency(taxAmount)}</span>
          </div>
        </div>

        <div className="border-t border-muted/30 pt-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground font-heading">Total:</span>
            </div>
            <span className="text-xl font-bold text-primary font-heading gradient-text">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 rounded bg-muted/20">
              <div className="font-semibold text-foreground">{allParts.length}</div>
              <div className="text-muted-foreground">Parts</div>
            </div>
            <div className="text-center p-2 rounded bg-muted/20">
              <div className="font-semibold text-foreground">{jobLines.length}</div>
              <div className="text-muted-foreground">Services</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
