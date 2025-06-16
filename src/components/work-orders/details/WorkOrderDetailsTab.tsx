
import React, { useEffect, useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';

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
      {/* Vehicle and Additional Details */}
      {(workOrder.vehicle_license_plate || workOrder.vehicle_vin) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {workOrder.vehicle_license_plate && (
                <div>
                  <p className="text-muted-foreground">License Plate</p>
                  <p className="font-medium">{workOrder.vehicle_license_plate}</p>
                </div>
              )}
              {workOrder.vehicle_vin && (
                <div>
                  <p className="text-muted-foreground">VIN</p>
                  <p className="font-medium">{workOrder.vehicle_vin}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editable Job Lines Grid */}
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

      {/* Parts Section */}
      <WorkOrderPartsSection
        workOrderId={workOrder.id}
        isEditMode={isEditMode}
      />
    </div>
  );
}
