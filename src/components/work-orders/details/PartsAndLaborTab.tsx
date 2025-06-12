
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';
import { PartsInventorySummary } from '../parts/PartsInventorySummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Wrench, DollarSign } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <DollarSign className="h-5 w-5 text-green-500" />
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${(totalLaborCost + totalPartsCost).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parts Summary - Show if there are parts */}
      {allParts.length > 0 && <PartsInventorySummary parts={allParts} />}

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

      {/* Parts Section - Show parts details if any exist */}
      {allParts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Parts Used ({allParts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allParts.map((part) => (
                <div key={part.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{part.name}</h4>
                        <p className="text-sm text-muted-foreground">Part #: {part.part_number}</p>
                        {part.description && (
                          <p className="text-sm text-muted-foreground mt-1">{part.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Qty: {part.quantity}</div>
                    <div className="text-sm text-muted-foreground">
                      ${Number(part.unit_price || 0).toFixed(2)} each
                    </div>
                    <div className="font-bold text-green-600">
                      ${(Number(part.quantity || 0) * Number(part.unit_price || 0)).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Order Total Summary */}
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
