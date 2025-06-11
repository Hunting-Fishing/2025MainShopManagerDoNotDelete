
import React from 'react';
import { WorkOrder, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Package, DollarSign, Clock } from 'lucide-react';
import { JobLinesWithPartsDisplay } from './JobLinesWithPartsDisplay';

interface PartsAndLaborTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function PartsAndLaborTab({
  workOrder,
  jobLines,
  allParts,
  onJobLinesChange,
  isEditMode
}: PartsAndLaborTabProps) {
  // Calculate totals
  const totalLaborHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  
  // Calculate parts costs using customer price (unit_price) which is the customer-facing price
  const totalPartsCost = allParts.reduce((sum, part) => {
    const customerPrice = part.unit_price || part.customerPrice || 0;
    const quantity = part.quantity || 1;
    return sum + (customerPrice * quantity);
  }, 0);
  
  const totalPartsCount = allParts.length;
  const grandTotal = totalLaborCost + totalPartsCost;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Labor</p>
                  <p className="text-lg font-bold">{jobLines.length} Lines</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{totalLaborHours.toFixed(1)} hrs</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  ${totalLaborCost.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Parts</p>
                  <p className="text-lg font-bold">{totalPartsCount} Items</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Customer Cost</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  ${totalPartsCost.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                  <p className="text-lg font-bold">{totalLaborHours.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grand Total</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    ${grandTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Job Lines and Parts Display */}
      <JobLinesWithPartsDisplay
        workOrderId={workOrder.id}
        jobLines={jobLines}
        onJobLinesChange={onJobLinesChange}
        isEditMode={isEditMode}
      />

      {/* Parts Summary if there are parts */}
      {allParts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Parts Summary ({allParts.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allParts.map((part) => {
                const customerPrice = part.unit_price || part.customerPrice || 0;
                const quantity = part.quantity || 1;
                const lineTotal = customerPrice * quantity;
                
                return (
                  <div key={part.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{part.name}</p>
                        {part.part_number && (
                          <Badge variant="outline" className="text-xs">
                            {part.part_number}
                          </Badge>
                        )}
                      </div>
                      {part.description && (
                        <p className="text-sm text-muted-foreground mt-1">{part.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Qty: {quantity}</span>
                        <span>Unit Price: ${customerPrice.toFixed(2)}</span>
                        {part.status && (
                          <Badge variant="secondary" className="text-xs">
                            {part.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700 dark:text-green-300">
                        ${lineTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {/* Parts Subtotal */}
              <div className="border-t pt-3 mt-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Parts Subtotal:</p>
                  <p className="font-bold text-lg text-purple-700 dark:text-purple-300">
                    ${totalPartsCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
