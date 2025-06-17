
import React, { useEffect, useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';

interface WorkOrderDetailsTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => Promise<void>;
  onJobLineDelete?: (jobLineId: string) => Promise<void>;
  onPartUpdate?: (part: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
  isEditMode: boolean;
}

export function WorkOrderDetailsTab({
  workOrder,
  jobLines,
  allParts,
  onJobLinesChange,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode,
}: WorkOrderDetailsTabProps) {
  const handleJobLineUpdate = async (updatedJobLine: WorkOrderJobLine) => {
    if (onJobLineUpdate) {
      await onJobLineUpdate(updatedJobLine);
    } else {
      // Fallback to local update
      const updatedJobLines = jobLines.map(line => 
        line.id === updatedJobLine.id ? updatedJobLine : line
      );
      onJobLinesChange(updatedJobLines);
    }
  };

  const handleJobLineDelete = async (jobLineId: string) => {
    if (onJobLineDelete) {
      await onJobLineDelete(jobLineId);
    } else {
      // Fallback to local update
      const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
      onJobLinesChange(updatedJobLines);
    }
  };

  const handlePartUpdate = async (updatedPart: WorkOrderPart) => {
    if (onPartUpdate) {
      await onPartUpdate(updatedPart);
    }
  };

  const handlePartDelete = async (partId: string) => {
    if (onPartDelete) {
      await onPartDelete(partId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Details */}
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

      {/* Unified Labor & Parts Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Labor & Parts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <UnifiedItemsTable
            jobLines={jobLines}
            allParts={allParts}
            onJobLineUpdate={isEditMode ? handleJobLineUpdate : undefined}
            onJobLineDelete={isEditMode ? handleJobLineDelete : undefined}
            onPartUpdate={isEditMode ? handlePartUpdate : undefined}
            onPartDelete={isEditMode ? handlePartDelete : undefined}
            isEditMode={isEditMode}
            showType="overview"
          />
        </CardContent>
      </Card>
    </div>
  );
}
