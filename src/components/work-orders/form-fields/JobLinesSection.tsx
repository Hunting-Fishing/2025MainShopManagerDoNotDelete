
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JobLinesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function JobLinesSection({
  workOrderId,
  jobLines,
  onJobLinesChange,
  isEditMode
}: JobLinesSectionProps) {
  if (isEditMode) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Job Lines Management</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EditableJobLinesGrid
            workOrderId={workOrderId}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Job Lines</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CompactJobLinesTable
          jobLines={jobLines}
          isEditMode={false}
        />
      </CardContent>
    </Card>
  );
}
