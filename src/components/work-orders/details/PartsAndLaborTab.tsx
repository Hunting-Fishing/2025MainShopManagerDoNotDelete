
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Wrench } from 'lucide-react';

interface PartsAndLaborTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
}

export function PartsAndLaborTab({
  workOrder,
  jobLines,
  allParts,
  onJobLinesChange,
  isEditMode = false
}: PartsAndLaborTabProps) {
  // Calculate totals
  const totalLaborHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalPartsCost = allParts.reduce((sum, part) => {
    const quantity = Number(part.quantity) || 0;
    const price = Number(part.unit_price) || 0;
    return sum + (quantity * price);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Labor Hours</p>
                <p className="text-2xl font-bold">{totalLaborHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <span className="text-white text-xs">$</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Labor Cost</p>
                <p className="text-2xl font-bold">${totalLaborCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Parts Cost</p>
                <p className="text-2xl font-bold">${totalPartsCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Lines Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Job Lines & Labor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableJobLinesGrid
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
          />
        </CardContent>
      </Card>

      {/* Total Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Work Order Total</h3>
              <p className="text-sm text-muted-foreground">
                Labor + Parts for all job lines
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                ${(totalLaborCost + totalPartsCost).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {jobLines.length} job lines • {allParts.length} parts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
