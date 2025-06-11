
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wrench, Package, DollarSign } from 'lucide-react';

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
  // Calculate labor totals
  const totalLaborHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);

  // Calculate parts totals - use unit_price and quantity
  const totalPartsValue = allParts.reduce((sum, part) => {
    const unitPrice = part.unit_price || part.customerPrice || 0;
    const quantity = part.quantity || 1;
    return sum + (unitPrice * quantity);
  }, 0);

  // Calculate grand total
  const grandTotal = totalLaborCost + totalPartsValue;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Labor Cost</p>
                <p className="text-2xl font-bold">${totalLaborCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{totalLaborHours.toFixed(1)} hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Parts Cost</p>
                <p className="text-2xl font-bold">${totalPartsValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{allParts.length} parts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">${grandTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Labor + Parts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Job Lines & Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {jobLines.map((jobLine, index) => {
            // Get parts for this job line
            const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
            const jobLinePartsTotal = jobLineParts.reduce((sum, part) => {
              const unitPrice = part.unit_price || part.customerPrice || 0;
              const quantity = part.quantity || 1;
              return sum + (unitPrice * quantity);
            }, 0);

            return (
              <div key={jobLine.id} className="border rounded-lg p-4 space-y-4">
                {/* Job Line Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{jobLine.name}</h3>
                    {jobLine.description && (
                      <p className="text-muted-foreground text-sm mt-1">{jobLine.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">{jobLine.category || 'General'}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Status: <Badge variant="secondary">{jobLine.status || 'pending'}</Badge>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Labor Details */}
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Labor Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Hours:</span>
                      <p className="font-medium">{jobLine.estimated_hours || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate:</span>
                      <p className="font-medium">${jobLine.labor_rate || 0}/hr</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Labor Cost:</span>
                      <p className="font-medium">${(jobLine.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium">{jobLine.category || 'Basic Maintenance'}</p>
                    </div>
                  </div>
                </div>

                {/* Associated Parts */}
                {jobLineParts.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Associated Parts ({jobLineParts.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {jobLineParts.map((part) => {
                        const unitPrice = part.unit_price || part.customerPrice || 0;
                        const quantity = part.quantity || 1;
                        const lineTotal = unitPrice * quantity;
                        
                        return (
                          <div key={part.id} className="flex items-center justify-between text-sm border-b border-green-200 dark:border-green-800 pb-2">
                            <div className="flex-1">
                              <p className="font-medium">{part.name}</p>
                              <div className="flex items-center gap-4 text-muted-foreground">
                                <span>Part #: {part.part_number}</span>
                                <span>Qty: {quantity}</span>
                                <span>Unit: ${unitPrice.toFixed(2)}</span>
                                {part.status && (
                                  <Badge variant="outline" className="text-xs">{part.status}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${lineTotal.toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-800">
                        <span className="font-medium">Parts Subtotal:</span>
                        <span className="font-medium">${jobLinePartsTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Line Total */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Job Line Total:</span>
                  <span className="font-semibold text-lg">
                    Labor: ${(jobLine.total_amount || 0).toFixed(2)} + Parts: ${jobLinePartsTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}

          {jobLines.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No job lines added yet</p>
            </div>
          )}

          {/* Final Totals */}
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between items-center text-lg">
              <span>Labor Subtotal:</span>
              <span className="font-semibold">${totalLaborCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>Parts Subtotal:</span>
              <span className="font-semibold">${totalPartsValue.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Grand Total:</span>
              <span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
