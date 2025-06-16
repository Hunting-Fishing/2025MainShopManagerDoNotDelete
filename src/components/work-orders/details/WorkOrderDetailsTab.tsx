
import React, { useEffect, useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';
import { WorkOrderStatusUpdate } from './WorkOrderStatusUpdate';
import { WorkOrderCommunications } from '../communications/WorkOrderCommunications';

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
  allParts: initialParts,
  onJobLinesChange,
  isEditMode,
}: WorkOrderDetailsTabProps) {
  const [allParts, setAllParts] = useState<WorkOrderPart[]>(initialParts);
  const [partsLoading, setPartsLoading] = useState(false);

  useEffect(() => {
    const fetchParts = async () => {
      if (workOrder.id) {
        try {
          setPartsLoading(true);
          const parts = await getWorkOrderParts(workOrder.id);
          setAllParts(parts);
        } catch (error) {
          console.error('Error fetching work order parts:', error);
          setAllParts([]);
        } finally {
          setPartsLoading(false);
        }
      }
    };

    fetchParts();
  }, [workOrder.id]);

  return (
    <div className="space-y-4">
      {/* Status Update - Compact */}
      <div className="flex items-center gap-4">
        <WorkOrderStatusUpdate workOrder={workOrder} />
        <Badge variant="outline" className="ml-2">
          {workOrder.status}
        </Badge>
      </div>

      {/* Work Order Summary - More Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Work Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {workOrder.status}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{workOrder.customer_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(workOrder.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {(workOrder.vehicle_make || workOrder.vehicle_model || workOrder.vehicle_year) && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="text-sm font-medium">
                {[workOrder.vehicle_year, workOrder.vehicle_make, workOrder.vehicle_model]
                  .filter(Boolean)
                  .join(' ')}
              </p>
              {workOrder.vehicle_license_plate && (
                <p className="text-xs text-muted-foreground">
                  License: {workOrder.vehicle_license_plate}
                </p>
              )}
              {workOrder.vehicle_vin && (
                <p className="text-xs text-muted-foreground">
                  VIN: {workOrder.vehicle_vin}
                </p>
              )}
            </div>
          )}

          {workOrder.description && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm font-medium">{workOrder.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable Job Lines Grid – Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Labor & Services (Editable)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EditableJobLinesGrid
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
          />
        </CardContent>
      </Card>

      {/* Parts Section - Compact */}
      <WorkOrderPartsSection
        workOrderId={workOrder.id}
        isEditMode={isEditMode}
      />

      {/* Customer Communications - Compact */}
      <WorkOrderCommunications workOrder={workOrder} />
    </div>
  );
}
