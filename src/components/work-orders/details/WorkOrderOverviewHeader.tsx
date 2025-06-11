
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { 
  Wrench, 
  Package, 
  DollarSign, 
  Clock, 
  Calculator,
  AlertTriangle,
  Tag
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTotalsWithDiscounts();
  }, [workOrder.id, jobLines, allParts]);

  const loadTotalsWithDiscounts = async () => {
    try {
      const totals = await calculateWorkOrderTotalsWithDiscounts(workOrder.id);
      setTotalsWithDiscounts(totals);
    } catch (error) {
      console.error('Error loading totals with discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate basic metrics
  const totalJobs = jobLines.length;
  const totalParts = allParts.length;
  const totalEstimatedHours = jobLines.reduce((sum, job) => sum + (job.estimatedHours || 0), 0);
  
  // Parts financial metrics
  const partsRetailTotal = allParts.reduce((sum, part) => sum + (part.customerPrice * part.quantity), 0);
  const partsCostTotal = allParts.reduce((sum, part) => sum + (part.supplierCost * part.quantity), 0);
  
  // Labor metrics
  const laborSubtotal = jobLines.reduce((sum, job) => sum + (job.totalAmount || 0), 0);
  
  // Job lines without parts
  const jobLinesWithoutParts = jobLines.filter(job => !job.parts || job.parts.length === 0);
  
  // Discount information
  const hasDiscounts = totalsWithDiscounts && totalsWithDiscounts.total_discounts > 0;
  const grandTotal = totalsWithDiscounts?.final_total || (laborSubtotal + partsRetailTotal);
  const totalDiscounts = totalsWithDiscounts?.total_discounts || 0;

  return (
    <div className="space-y-4">
      {/* Alert for job lines without parts */}
      {jobLinesWithoutParts.length > 0 && (
        <Alert className="border-pink-200 bg-pink-50">
          <AlertTriangle className="h-4 w-4 text-pink-600" />
          <AlertDescription className="text-pink-800">
            <strong>{jobLinesWithoutParts.length}</strong> job line{jobLinesWithoutParts.length > 1 ? 's' : ''} 
            {jobLinesWithoutParts.length > 1 ? ' have' : ' has'} no parts associated:
            <span className="ml-2 font-medium">
              {jobLinesWithoutParts.map(job => job.name).join(', ')}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Main metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Jobs */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Jobs</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{totalJobs}</div>
          </CardContent>
        </Card>

        {/* Parts Count */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Total Parts</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{totalParts}</div>
          </CardContent>
        </Card>

        {/* Parts Cost */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Parts Cost</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              ${partsCostTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Parts Retail */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Parts Retail</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              ${partsRetailTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Estimated Hours */}
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">Est. Hours</span>
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              {totalEstimatedHours.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        {/* Labor Total */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Labor Total</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {hasDiscounts && totalsWithDiscounts.labor_discounts > 0 ? (
                <div>
                  <span className="line-through text-lg text-muted-foreground">
                    ${laborSubtotal.toFixed(2)}
                  </span>
                  <div>${totalsWithDiscounts.labor_total.toFixed(2)}</div>
                </div>
              ) : (
                `$${laborSubtotal.toFixed(2)}`
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grand Total */}
        <Card className="bg-slate-50 border-slate-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Grand Total</span>
              {hasDiscounts && (
                <Tag className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ${grandTotal.toFixed(2)}
            </div>
            {hasDiscounts && (
              <div className="text-sm">
                <span className="text-muted-foreground">Savings: </span>
                <span className="text-green-600 font-medium">
                  ${totalDiscounts.toFixed(2)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed breakdown if discounts are applied */}
      {hasDiscounts && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Discount Summary</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {totalsWithDiscounts.labor_discounts > 0 && (
                <div>
                  <span className="text-muted-foreground">Labor Discounts:</span>
                  <div className="font-medium text-green-700">
                    -${totalsWithDiscounts.labor_discounts.toFixed(2)}
                  </div>
                </div>
              )}
              {totalsWithDiscounts.parts_discounts > 0 && (
                <div>
                  <span className="text-muted-foreground">Parts Discounts:</span>
                  <div className="font-medium text-green-700">
                    -${totalsWithDiscounts.parts_discounts.toFixed(2)}
                  </div>
                </div>
              )}
              {totalsWithDiscounts.work_order_discounts > 0 && (
                <div>
                  <span className="text-muted-foreground">Order Discounts:</span>
                  <div className="font-medium text-green-700">
                    -${totalsWithDiscounts.work_order_discounts.toFixed(2)}
                  </div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Total Savings:</span>
                <div className="font-bold text-green-700">
                  -${totalDiscounts.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
