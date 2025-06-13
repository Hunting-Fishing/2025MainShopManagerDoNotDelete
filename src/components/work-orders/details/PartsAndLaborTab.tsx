
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';

interface PartsAndLaborTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (updatedJobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function PartsAndLaborTab({
  workOrder,
  jobLines,
  onJobLinesChange,
  isEditMode
}: PartsAndLaborTabProps) {
  return (
    <div className="space-y-6">
      {/* Job Lines Section */}
      <Card>
        <CardHeader>
          <CardTitle>Job Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <JobLinesGrid
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>

      {/* Parts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Parts</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>
    </div>
  );
}
