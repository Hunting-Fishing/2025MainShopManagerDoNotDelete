
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';
import { JobLineEditDialog } from './JobLineEditDialog';
import { CompactPartsTable } from '../parts/CompactPartsTable';

interface JobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete: (jobLineId: string) => void;
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
}

export function JobLinesTable({
  jobLines,
  allParts,
  onUpdate,
  onDelete,
  onPartUpdate,
  onPartDelete
}: JobLinesTableProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = (jobLine: WorkOrderJobLine) => {
    console.log('Edit job line clicked:', jobLine.id, jobLine.name);
    setEditingJobLine(jobLine);
    setIsEditDialogOpen(true);
  };

  const handleSaveJobLine = async (updatedJobLine: WorkOrderJobLine) => {
    console.log('Saving job line:', updatedJobLine);
    await onUpdate(updatedJobLine);
    setIsEditDialogOpen(false);
    setEditingJobLine(null);
  };

  const handleDeleteClick = (jobLineId: string) => {
    if (confirm('Are you sure you want to delete this job line?')) {
      onDelete(jobLineId);
    }
  };

  if (jobLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No job lines found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {jobLines.map((jobLine) => {
          const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
          
          return (
            <div key={jobLine.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{jobLine.name}</h4>
                    <Badge variant="outline">{jobLine.status || 'pending'}</Badge>
                  </div>
                  {jobLine.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {jobLine.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(jobLine)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(jobLine.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Hours: </span>
                  {jobLine.estimated_hours || 0}
                </div>
                <div>
                  <span className="text-muted-foreground">Rate: </span>
                  ${jobLine.labor_rate || 0}
                </div>
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  ${jobLine.total_amount || 0}
                </div>
              </div>

              {jobLineParts.length > 0 && (
                <div className="pt-3 border-t">
                  <h5 className="text-sm font-medium mb-2">Associated Parts:</h5>
                  <CompactPartsTable
                    parts={jobLineParts}
                    onUpdate={onPartUpdate || (() => {})}
                    onDelete={onPartDelete || (() => {})}
                    isEditMode={true}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <JobLineEditDialog
        jobLine={editingJobLine}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveJobLine}
      />
    </>
  );
}
