
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineCard } from './JobLineCard';

interface JobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
}

export function JobLinesTable({ jobLines, onUpdate, onDelete }: JobLinesTableProps) {
  const handlePartsChange = (newParts: any[]) => {
    // Handle parts change if needed
    console.log('Parts changed:', newParts);
  };

  if (jobLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job lines added yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobLines.map((jobLine) => (
        <JobLineCard
          key={jobLine.id}
          jobLine={jobLine}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isEditMode={true}
        />
      ))}
    </div>
  );
}
