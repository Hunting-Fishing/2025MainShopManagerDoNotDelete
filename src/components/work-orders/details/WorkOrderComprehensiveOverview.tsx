
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderCustomerVehicleInfo } from './WorkOrderCustomerVehicleInfo';
import { WorkOrderFinancialSummary } from './WorkOrderFinancialSummary';
import { Wrench, Package, Clock, DollarSign } from 'lucide-react';

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
  // Group parts by job line
  const partsByJobLine = allParts.reduce((acc, part) => {
    const jobLineId = part.job_line_id || 'unlinked';
    if (!acc[jobLineId]) acc[jobLineId] = [];
    acc[jobLineId].push(part);
    return acc;
  }, {} as Record<string, WorkOrderPart[]>);

  // Calculate totals
  const totalLaborHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalLaborAmount = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalPartsAmount = allParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
  const totalBillableTime = timeEntries.reduce((sum, entry) => {
    return entry.billable ? sum + (entry.duration || 0) : sum;
  }, 0);

  const formatTime = (minutes: number) => {
    if (minutes === 0) return "No time logged";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Work Order Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{workOrder.description}</p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {workOrder.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">Est. Labor</span>
              </div>
              <p className="text-2xl font-bold">{totalLaborHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">${totalLaborAmount.toFixed(2)}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Parts</span>
              </div>
              <p className="text-2xl font-bold">{allParts.length}</p>
              <p className="text-xs text-muted-foreground">${totalPartsAmount.toFixed(2)}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Time Logged</span>
              </div>
              <p className="text-2xl font-bold">{formatTime(totalBillableTime)}</p>
              <p className="text-xs text-muted-foreground">{timeEntries.length} entries</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold">${(totalLaborAmount + totalPartsAmount).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">estimated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer and Vehicle Information */}
      <WorkOrderCustomerVehicleInfo workOrder={workOrder} />

      {/* Job Lines with Parts Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>Job Lines & Associated Parts</CardTitle>
        </CardHeader>
        <CardContent>
          {jobLines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No job lines found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobLines.map((jobLine) => {
                const jobLineParts = partsByJobLine[jobLine.id] || [];
                const jobLinePartsTotal = jobLineParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
                const jobLineGrandTotal = (jobLine.total_amount || 0) + jobLinePartsTotal;

                return (
                  <div key={jobLine.id} className="border rounded-lg p-4 bg-gray-50">
                    {/* Job Line Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{jobLine.name}</h4>
                        {jobLine.description && (
                          <p className="text-sm text-muted-foreground mt-1">{jobLine.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">{jobLine.status}</Badge>
                          {jobLine.category && (
                            <Badge variant="secondary">{jobLine.category}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Job Line Details */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-3 bg-white rounded border">
                      <div>
                        <span className="text-xs text-muted-foreground">Hours</span>
                        <p className="font-medium">{jobLine.estimated_hours || 0}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Rate</span>
                        <p className="font-medium">${jobLine.labor_rate || 0}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Labor</span>
                        <p className="font-medium">${jobLine.total_amount || 0}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Parts ({jobLineParts.length})</span>
                        <p className="font-medium">${jobLinePartsTotal.toFixed(2)}</p>
                      </div>
                      <div className="border-l pl-4">
                        <span className="text-xs text-muted-foreground">Line Total</span>
                        <p className="font-bold text-lg">${jobLineGrandTotal.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Associated Parts */}
                    {jobLineParts.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Associated Parts ({jobLineParts.length})
                        </h5>
                        <div className="grid gap-2">
                          {jobLineParts.map((part) => (
                            <div key={part.id} className="flex justify-between items-center p-2 bg-white rounded border text-sm">
                              <div className="flex-1">
                                <span className="font-medium">{part.name}</span>
                                {part.part_number && (
                                  <span className="text-muted-foreground ml-2">({part.part_number})</span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-muted-foreground">Qty: {part.quantity} × ${part.unit_price}</span>
                                <span className="font-medium ml-2">${part.total_price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unlinked Parts */}
              {partsByJobLine.unlinked && partsByJobLine.unlinked.length > 0 && (
                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-yellow-600" />
                    Unlinked Parts ({partsByJobLine.unlinked.length})
                  </h4>
                  <div className="grid gap-2">
                    {partsByJobLine.unlinked.map((part) => (
                      <div key={part.id} className="flex justify-between items-center p-2 bg-white rounded border text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{part.name}</span>
                          {part.part_number && (
                            <span className="text-muted-foreground ml-2">({part.part_number})</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">Qty: {part.quantity} × ${part.unit_price}</span>
                          <span className="font-medium ml-2">${part.total_price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <WorkOrderFinancialSummary
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
      />
    </div>
  );
}
