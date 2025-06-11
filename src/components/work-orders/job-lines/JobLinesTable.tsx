
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineCard } from './JobLineCard';
import { EditJobLineDialog } from './EditJobLineDialog';

interface JobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
}

export function JobLinesTable({ jobLines, onUpdate, onDelete }: JobLinesTableProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      onUpdate(updatedJobLine);
    }
    setIsEditDialogOpen(false);
    setEditingJobLine(null);
  };

  if (jobLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job lines added yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {jobLines.map((jobLine) => (
          <JobLineCard
            key={jobLine.id}
            jobLine={jobLine}
            onEdit={handleEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {editingJobLine && (
        <EditJobLineDialog
          jobLine={editingJobLine}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}
