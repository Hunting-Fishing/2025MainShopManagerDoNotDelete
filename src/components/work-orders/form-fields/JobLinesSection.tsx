
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JobLinesSectionProps {
  workOrderId: string;
  description?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
  shopId?: string;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  isEditMode = true,
  shopId
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
          allParts={[]}
          isEditMode={false}
        />
      </CardContent>
    </Card>
  );
}
