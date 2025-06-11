
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalAmount = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Order Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Job Lines</p>
            <p className="text-2xl font-bold">{jobLines.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">{totalEstimatedHours.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Parts Count</p>
            <p className="text-2xl font-bold">{allParts.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
