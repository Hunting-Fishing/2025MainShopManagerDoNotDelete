
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { CompactJobLinesTable } from './CompactJobLinesTable';

interface JobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  allParts?: WorkOrderPart[];
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
}

export function JobLinesTable({ 
  jobLines, 
  onUpdate, 
  onDelete, 
  allParts = [],
  onPartUpdate,
  onPartDelete 
}: JobLinesTableProps) {
  if (jobLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job lines added yet
      </div>
    );
  }

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    if (onPartUpdate) {
      onPartUpdate(updatedPart);
    } else {
      console.log('Part update handler not provided:', updatedPart);
    }
  };

  const handlePartDelete = (partId: string) => {
    if (onPartDelete) {
      onPartDelete(partId);
    } else {
      console.log('Part delete handler not provided:', partId);
    }
  };

  return (
    <CompactJobLinesTable
      jobLines={jobLines}
      allParts={allParts}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onPartUpdate={handlePartUpdate}
      onPartDelete={handlePartDelete}
      isEditMode={true}
    />
  );
}
