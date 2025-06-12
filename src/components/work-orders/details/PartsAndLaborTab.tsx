
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';
import { JobLinesWithPartsDisplay } from './JobLinesWithPartsDisplay';
import { Wrench, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const totalLaborHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalPartsCost = allParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
  const grandTotal = totalLaborCost + totalPartsCost;

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
                <p className="text-xl font-bold">{totalLaborHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <span className="text-white text-xs">$</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Labor Cost</p>
                <p className="text-xl font-bold">${totalLaborCost.toFixed(2)}</p>
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
                <p className="text-xl font-bold">${totalPartsCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500 rounded-lg">
                <span className="text-white text-xs">T</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">${grandTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Order Status and Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Work Order Overview</span>
            <Badge variant="outline">{workOrder.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{workOrder.customer_name || 'Unknown Customer'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-medium">
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
              </p>
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

      {/* Job Lines and Parts Section */}
      {isEditMode ? (
        <EditableJobLinesGrid
          workOrderId={workOrder.id}
          jobLines={jobLines}
          onJobLinesChange={onJobLinesChange}
        />
      ) : (
        <JobLinesWithPartsDisplay
          workOrderId={workOrder.id}
          jobLines={jobLines}
          onJobLinesChange={onJobLinesChange}
          isEditMode={false}
        />
      )}

      {/* No Data State */}
      {jobLines.length === 0 && !isEditMode && (
        <Card>
          <CardContent className="p-12 text-center">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Job Lines</h3>
            <p className="text-muted-foreground mb-4">
              No labor or job lines have been added to this work order yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
