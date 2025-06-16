
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { CompactJobLinesTable } from './CompactJobLinesTable';

interface JobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
}

export function JobLinesTable({ jobLines, onUpdate, onDelete }: JobLinesTableProps) {
  if (jobLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job lines added yet
      </div>
    );
  }

  return (
    <CompactJobLinesTable
      jobLines={jobLines}
      allParts={[]}
      onUpdate={onUpdate}
      onDelete={onDelete}
      isEditMode={true}
    />
  );
}
