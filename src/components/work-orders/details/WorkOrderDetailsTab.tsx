
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobLinesWithPartsDisplay } from './JobLinesWithPartsDisplay';
import { WorkOrderOverviewHeader } from './WorkOrderOverviewHeader';

interface WorkOrderDetailsTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function WorkOrderDetailsTab({
  workOrder,
  jobLines,
  allParts,
  onJobLinesChange,
  isEditMode
}: WorkOrderDetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Comprehensive Overview Header */}
      <WorkOrderOverviewHeader 
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
      />

      {/* Work Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Work Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{workOrder.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{workOrder.customer_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(workOrder.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {workOrder.description && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{workOrder.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Lines with Parts */}
      <JobLinesWithPartsDisplay
        workOrderId={workOrder.id}
        jobLines={jobLines}
        onJobLinesChange={onJobLinesChange}
        isEditMode={isEditMode}
      />
    </div>
  );
}
