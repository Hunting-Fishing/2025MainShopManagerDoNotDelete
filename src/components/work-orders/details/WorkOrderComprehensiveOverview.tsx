import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderFinancialSummary } from './WorkOrderFinancialSummary';
import { JobLinesWithPartsDisplay } from './JobLinesWithPartsDisplay';

interface WorkOrderComprehensiveOverviewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  onJobLinesChange: (updatedJobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function WorkOrderComprehensiveOverview({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  onJobLinesChange,
  isEditMode
}: WorkOrderComprehensiveOverviewProps) {
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalAmount = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalTimeLogged = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600; // Convert seconds to hours

  return (
    <div className="space-y-6">
      {/* Work Order Overview Header */}
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

      {/* Work Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Work Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className="mt-1">
                {workOrder.status}
              </Badge>
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
          
          {/* Vehicle Information */}
          {(workOrder.vehicle_make || workOrder.vehicle_model || workOrder.vehicle_year) && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-medium">
                {[workOrder.vehicle_year, workOrder.vehicle_make, workOrder.vehicle_model]
                  .filter(Boolean)
                  .join(' ')}
              </p>
              {workOrder.vehicle_license_plate && (
                <p className="text-sm text-muted-foreground">
                  License: {workOrder.vehicle_license_plate}
                </p>
              )}
              {workOrder.vehicle_vin && (
                <p className="text-sm text-muted-foreground">
                  VIN: {workOrder.vehicle_vin}
                </p>
              )}
            </div>
          )}

          {workOrder.description && (
            <div className="mt-4 pt-4 border-t">
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

      {/* Time Tracking Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Time Tracking Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Time Logged:</span>
              <span className="font-medium">
                {timeEntries.length > 0 ? `${totalTimeLogged.toFixed(1)} hours` : 'No time logged'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Time Entries:</span>
              <span className="font-medium">{timeEntries.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <WorkOrderFinancialSummary
        jobLines={jobLines}
        allParts={allParts}
        timeLogged={totalTimeLogged}
      />
    </div>
  );
}
