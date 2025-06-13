
import React from 'react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderDetailsHeader } from './WorkOrderDetailsHeader';
import { JobLinesWithPartsDisplay } from './JobLinesWithPartsDisplay';
import { WorkOrderFinancialSummary } from './WorkOrderFinancialSummary';
import { WorkOrderCustomerVehicleInfo } from './WorkOrderCustomerVehicleInfo';

interface WorkOrderComprehensiveOverviewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
}

export function WorkOrderComprehensiveOverview({
  workOrder,
  jobLines,
  allParts,
  timeEntries
}: WorkOrderComprehensiveOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Work Order Header */}
      <WorkOrderDetailsHeader 
        workOrder={workOrder}
      />

      {/* Customer & Vehicle Information */}
      <WorkOrderCustomerVehicleInfo 
        workOrder={workOrder}
      />

      {/* Financial Summary */}
      <WorkOrderFinancialSummary 
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
      />

      {/* Job Lines with Parts */}
      <JobLinesWithPartsDisplay
        workOrderId={workOrder.id}
        jobLines={jobLines}
        onJobLinesChange={() => {}}
        isEditMode={false}
      />

      {/* Time Tracking Summary */}
      {timeEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{timeEntries.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60)}h
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billable Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(timeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Notes */}
      {workOrder.description && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Notes & Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">
              {workOrder.description}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
