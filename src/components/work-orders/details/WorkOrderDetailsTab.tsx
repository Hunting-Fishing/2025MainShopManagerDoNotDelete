
import React, { useEffect, useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { JobLinesTable } from '../job-lines/JobLinesTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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

  const handleJobLineUpdate = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(line => 
      line.id === updatedJobLine.id ? updatedJobLine : line
    );
    onJobLinesChange(updatedJobLines);
  };

  const handleJobLineDelete = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    const updatedParts = allParts.map(part => 
      part.id === updatedPart.id ? updatedPart : part
    );
    setAllParts(updatedParts);
  };

  const handlePartDelete = (partId: string) => {
    const updatedParts = allParts.filter(part => part.id !== partId);
    setAllParts(updatedParts);
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Details - Compact */}
      {(workOrder.vehicle_license_plate || workOrder.vehicle_vin) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {workOrder.vehicle_license_plate && (
                <div>
                  <span className="text-muted-foreground">License Plate: </span>
                  <span className="font-medium">{workOrder.vehicle_license_plate}</span>
                </div>
              )}
              {workOrder.vehicle_vin && (
                <div>
                  <span className="text-muted-foreground">VIN: </span>
                  <span className="font-medium">{workOrder.vehicle_vin}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unified Job Lines & Parts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Labor & Parts</CardTitle>
            {isEditMode && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job Line
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {partsLoading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Loading job lines and parts...
            </div>
          ) : (
            <JobLinesTable
              jobLines={jobLines}
              allParts={allParts}
              onUpdate={handleJobLineUpdate}
              onDelete={handleJobLineDelete}
              onPartUpdate={handlePartUpdate}
              onPartDelete={handlePartDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
