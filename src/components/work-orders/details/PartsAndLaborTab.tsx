
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { updateWorkOrderJobLine, deleteWorkOrderJobLine } from '@/services/workOrder/jobLinesService';

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
  
  const handleJobLineUpdate = async (updatedJobLine: WorkOrderJobLine) => {
    try {
      await updateWorkOrderJobLine(updatedJobLine);
      const updatedJobLines = jobLines.map(line => 
        line.id === updatedJobLine.id ? updatedJobLine : line
      );
      onJobLinesChange(updatedJobLines);
    } catch (error) {
      console.error('Failed to update job line:', error);
    }
  };

  const handleJobLineDelete = async (jobLineId: string) => {
    try {
      await deleteWorkOrderJobLine(jobLineId);
      const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
      onJobLinesChange(updatedJobLines);
    } catch (error) {
      console.error('Failed to delete job line:', error);
    }
  };

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
            onUpdate={handleJobLineUpdate}
            onDelete={handleJobLineDelete}
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
