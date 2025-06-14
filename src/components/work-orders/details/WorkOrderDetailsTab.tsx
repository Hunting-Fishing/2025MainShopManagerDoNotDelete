import React, { useEffect, useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobLinesWithPartsDisplay } from './JobLinesWithPartsDisplay';
import { WorkOrderCommunications } from '../communications/WorkOrderCommunications';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

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
  isEditMode
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
    <div className="space-y-6">
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

      {/* Parts Section */}
      <WorkOrderPartsSection
        workOrderId={workOrder.id}
        isEditMode={isEditMode}
      />

      {/* Customer Communications */}
      <WorkOrderCommunications workOrder={workOrder} />
    </div>
  );
}
