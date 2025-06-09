
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';

interface JobLinesSectionProps {
  workOrderId: string;
  description: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  shopId?: string;
  isEditMode?: boolean;
  onPartsUpdated?: () => void;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  shopId,
  isEditMode = false,
  onPartsUpdated
}: JobLinesSectionProps) {
  const handleUpdate = (jobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(jl => 
      jl.id === jobLine.id ? jobLine : jl
    );
    onJobLinesChange(updatedJobLines);
  };

  const handleDelete = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(jl => jl.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  const handleRemovePart = (partId: string) => {
    // Find and remove the part from the appropriate job line
    const updatedJobLines = jobLines.map(jobLine => ({
      ...jobLine,
      parts: jobLine.parts?.filter(part => part.id !== partId) || []
    }));
    onJobLinesChange(updatedJobLines);
    
    // Trigger refresh to get updated data from database
    if (onPartsUpdated) {
      onPartsUpdated();
    }
  };

  return (
    <JobLinesGrid
      jobLines={jobLines}
      showSummary={true}
      isEditMode={isEditMode}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onRemovePart={handleRemovePart}
      onPartsUpdated={onPartsUpdated}
    />
  );
}
