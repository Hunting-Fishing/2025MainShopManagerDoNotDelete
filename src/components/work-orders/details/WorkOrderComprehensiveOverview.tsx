
import React from 'react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { WorkOrderFinancialSummary } from './WorkOrderFinancialSummary';

export interface WorkOrderComprehensiveOverviewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
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
  const totalLaborAmount = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalPartsValue = allParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
  const totalTimeLogged = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

  // Group parts by job line
  const partsGroupedByJobLine = allParts.reduce((acc, part) => {
    const jobLineId = part.job_line_id || 'unassigned';
    if (!acc[jobLineId]) {
      acc[jobLineId] = [];
    }
    acc[jobLineId].push(part);
    return acc;
  }, {} as Record<string, WorkOrderPart[]>);

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Job Lines</p>
                <p className="text-2xl font-bold">{jobLines.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Hours</p>
                <p className="text-2xl font-bold">{totalEstimatedHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Parts Count</p>
                <p className="text-2xl font-bold">{allParts.length}</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Logged</p>
                <p className="text-2xl font-bold">
                  {totalTimeLogged > 0 ? `${(totalTimeLogged / 60).toFixed(1)}h` : 'No time logged'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Job Lines with Parts Breakdown */}
      {jobLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Lines & Parts Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobLines.map((jobLine) => {
                const jobLineParts = partsGroupedByJobLine[jobLine.id] || [];
                const jobLinePartsValue = jobLineParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
                
                return (
                  <div key={jobLine.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{jobLine.name}</h4>
                        {jobLine.description && (
                          <p className="text-sm text-muted-foreground">{jobLine.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {jobLine.estimated_hours}h @ ${jobLine.labor_rate}/hr
                        </p>
                        <p className="font-semibold">${(jobLine.total_amount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {jobLineParts.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Parts ({jobLineParts.length}):
                        </p>
                        <div className="space-y-1">
                          {jobLineParts.map((part) => (
                            <div key={part.id} className="flex justify-between text-sm">
                              <span>{part.name} (Qty: {part.quantity})</span>
                              <span className="font-medium">${(part.total_price || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
                          <span>Parts Subtotal:</span>
                          <span>${jobLinePartsValue.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unassigned Parts */}
      {partsGroupedByJobLine.unassigned?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Unassigned Parts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {partsGroupedByJobLine.unassigned.map((part) => (
                <div key={part.id} className="flex justify-between items-center p-2 bg-amber-50 rounded">
                  <span className="text-sm">{part.name} (Qty: {part.quantity})</span>
                  <span className="font-medium">${(part.total_price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      <WorkOrderFinancialSummary
        laborTotal={totalLaborAmount}
        partsTotal={totalPartsValue}
        estimatedHours={totalEstimatedHours}
        timeLogged={totalTimeLogged}
      />
    </div>
  );
}
