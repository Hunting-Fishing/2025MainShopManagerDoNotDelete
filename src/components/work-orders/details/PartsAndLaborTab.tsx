
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
  // Calculate totals
  const totalLaborCost = jobLines.reduce((sum, line) => {
    const laborCost = (line.estimated_hours || 0) * (line.labor_rate || 0);
    return sum + laborCost;
  }, 0);

  const totalPartsCost = allParts.reduce((sum, part) => {
    return sum + (part.quantity * part.unit_price);
  }, 0);

  const grandTotal = totalLaborCost + totalPartsCost;

  // Get parts for a specific job line
  const getPartsForJobLine = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  // Calculate parts cost for a specific job line
  const getJobLinePartsCost = (jobLineId: string) => {
    const jobLineParts = getPartsForJobLine(jobLineId);
    return jobLineParts.reduce((sum, part) => sum + (part.quantity * part.unit_price), 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Labor Subtotal</p>
                <p className="text-2xl font-bold">${totalLaborCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Parts Subtotal</p>
                <p className="text-2xl font-bold">${totalPartsCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Grand Total</p>
                <p className="text-2xl font-bold">${grandTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Lines with Parts */}
      <div className="space-y-4">
        {jobLines.map((jobLine) => {
          const jobLineParts = getPartsForJobLine(jobLine.id);
          const jobLineLaborCost = (jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0);
          const jobLinePartsCost = getJobLinePartsCost(jobLine.id);
          const jobLineTotal = jobLineLaborCost + jobLinePartsCost;

          return (
            <Card key={jobLine.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    {jobLine.name}
                  </CardTitle>
                  <Badge variant="outline" className="font-mono">
                    {jobLine.category}
                  </Badge>
                </div>
                {jobLine.description && (
                  <p className="text-sm text-muted-foreground">{jobLine.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Labor Details */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Labor Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Hours:</p>
                      <p className="font-medium">{jobLine.estimated_hours || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rate:</p>
                      <p className="font-medium">${(jobLine.labor_rate || 0).toFixed(2)}/hr</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Labor Cost:</p>
                      <p className="font-medium">${jobLineLaborCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category:</p>
                      <p className="font-medium">{jobLine.category || 'Basic Maintenance'}</p>
                    </div>
                  </div>
                </div>

                {/* Associated Parts */}
                {jobLineParts.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Associated Parts ({jobLineParts.length})
                    </h4>
                    <div className="space-y-3">
                      {jobLineParts.map((part) => (
                        <div key={part.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                          <div className="flex-1">
                            <p className="font-medium">{part.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Part #: {part.part_number} • Qty: {part.quantity} • Unit: ${part.unit_price.toFixed(2)}
                            </p>
                            {part.status && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {part.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${(part.quantity * part.unit_price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center font-medium">
                      <span>Parts Subtotal:</span>
                      <span>${jobLinePartsCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Job Line Total */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-2 border-dashed">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Job Line Total:</span>
                    <span>
                      Labor: ${jobLineLaborCost.toFixed(2)} + Parts: ${jobLinePartsCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right text-xl font-bold text-primary mt-2">
                    ${jobLineTotal.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Footer */}
      <Card className="bg-primary/5 border-primary">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span>Labor Subtotal:</span>
              <span className="font-mono">${totalLaborCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Parts Subtotal:</span>
              <span className="font-mono">${totalPartsCost.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Grand Total:</span>
              <span className="font-mono">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
