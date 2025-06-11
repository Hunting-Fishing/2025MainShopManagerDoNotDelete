
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { 
  DollarSign, 
  Clock, 
  Package, 
  Wrench, 
  TrendingUp, 
  Calculator,
  Target
} from 'lucide-react';
import { calculateWorkOrderTotalsWithDiscounts } from '@/services/discountService';

interface WorkOrderOverviewHeaderProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
}

export function WorkOrderOverviewHeader({
  workOrder,
  jobLines,
  allParts
}: WorkOrderOverviewHeaderProps) {
  const [totalsWithDiscounts, setTotalsWithDiscounts] = useState<any>(null);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const totals = await calculateWorkOrderTotalsWithDiscounts(workOrder.id);
        setTotalsWithDiscounts(totals);
      } catch (error) {
        console.error('Error calculating totals with discounts:', error);
      }
    };

    fetchTotals();
  }, [workOrder.id]);

  // Calculate labor totals
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimatedHours || 0), 0);
  const totalLaborAmount = jobLines.reduce((sum, line) => {
    const hours = line.estimatedHours || 0;
    const rate = line.laborRate || 0;
    return sum + (hours * rate);
  }, 0);

  // Calculate parts totals
  const totalPartsRetail = allParts.reduce((sum, part) => sum + (part.customerPrice * part.quantity), 0);
  const totalPartsCost = allParts.reduce((sum, part) => sum + (part.supplierCost * part.quantity), 0);
  const totalPartsProfit = totalPartsRetail - totalPartsCost;
  const partsProfitMargin = totalPartsCost > 0 ? ((totalPartsProfit / totalPartsCost) * 100) : 0;

  // Calculate overall totals
  const subtotal = totalLaborAmount + totalPartsRetail;
  const finalTotal = totalsWithDiscounts?.final_total || subtotal;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Labor Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            Labor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Hours:</span>
            <span className="font-medium">{totalEstimatedHours.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="font-medium text-lg">${totalLaborAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Parts Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-green-600" />
            Parts ({allParts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Retail:</span>
            <span className="font-medium">${totalPartsRetail.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Cost:</span>
            <span className="font-medium text-red-600">${totalPartsCost.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Parts Profit */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            Parts Profit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Profit:</span>
            <span className="font-medium text-lg text-green-600">
              ${totalPartsProfit.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Margin:</span>
            <Badge variant={partsProfitMargin >= 50 ? "default" : partsProfitMargin >= 25 ? "secondary" : "destructive"}>
              {partsProfitMargin.toFixed(1)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-orange-600" />
            Work Order Total
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          {totalsWithDiscounts?.total_discounts > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">Discounts:</span>
              <span className="font-medium text-green-600">
                -${totalsWithDiscounts.total_discounts.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="font-bold text-xl">${finalTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
