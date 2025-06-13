
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Calendar, FileText, Activity } from 'lucide-react';
import { WorkOrderFinancialSummary } from './WorkOrderFinancialSummary';
import { WorkOrderCustomerVehicleInfo } from './WorkOrderCustomerVehicleInfo';

interface WorkOrderComprehensiveOverviewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
}

export function WorkOrderComprehensiveOverview({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  onJobLinesChange,
  isEditMode = false
}: WorkOrderComprehensiveOverviewProps) {
  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const laborTotal = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const partsTotal = allParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
  const grandTotal = laborTotal + partsTotal;

  return (
    <div className="space-y-6">
      {/* Work Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Work Order #{workOrder.work_order_number || workOrder.id.slice(-8)}
              </CardTitle>
              <p className="text-muted-foreground">
                Created {new Date(workOrder.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {workOrder.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {workOrder.description && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{workOrder.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer and Vehicle Information */}
      <WorkOrderCustomerVehicleInfo workOrder={workOrder} />

      {/* Financial Summary */}
      <WorkOrderFinancialSummary 
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Job Lines</p>
                <p className="text-2xl font-bold">{jobLines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Parts</p>
                <p className="text-2xl font-bold">{allParts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Time Logged</p>
                <p className="text-2xl font-bold">{totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${grandTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Lines Summary */}
      {jobLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Lines Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobLines.map((jobLine) => (
                <div key={jobLine.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{jobLine.name}</h4>
                    {jobLine.description && (
                      <p className="text-sm text-muted-foreground">{jobLine.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(jobLine.total_amount || 0).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {jobLine.estimated_hours || 0}h estimated
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Work Order Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(workOrder.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            
            {workOrder.updated_at !== workOrder.created_at && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(workOrder.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {timeEntries.length > 0 && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Time Entries</p>
                  <p className="text-sm text-muted-foreground">
                    {timeEntries.length} entries totaling {totalHours} hours
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      {workOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{workOrder.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
