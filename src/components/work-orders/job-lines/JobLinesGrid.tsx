
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3 } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineCard } from './JobLineCard';
import { AddJobLineDialog } from './AddJobLineDialog';

interface JobLinesGridProps {
  jobLines: WorkOrderJobLine[];
  workOrderId: string;
  onJobLineAdded: () => void;
  onJobLineUpdated: (jobLine: WorkOrderJobLine) => void;
  onJobLineDeleted: (jobLineId: string) => void;
  onRemovePart?: (partId: string) => void;
  isEditMode?: boolean;
}

export function JobLinesGrid({
  jobLines,
  workOrderId,
  onJobLineAdded,
  onJobLineUpdated,
  onJobLineDeleted,
  onRemovePart,
  isEditMode = false
}: JobLinesGridProps) {
  const [addJobLineDialogOpen, setAddJobLineDialogOpen] = useState(false);

  const handleJobLineAdded = () => {
    onJobLineAdded();
    setAddJobLineDialogOpen(false);
  };

  const handleJobLineUpdated = (updatedJobLine: WorkOrderJobLine) => {
    onJobLineUpdated(updatedJobLine);
  };

  const handleJobLineDeleted = (jobLineId: string) => {
    onJobLineDeleted(jobLineId);
  };

  const calculateTotal = () => {
    return jobLines.reduce((total, jobLine) => {
      const laborTotal = jobLine.totalAmount || 0;
      const partsTotal = jobLine.parts?.reduce((partSum, part) => 
        partSum + (part.customerPrice * part.quantity), 0) || 0;
      return total + laborTotal + partsTotal;
    }, 0);
  };

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Job Lines</CardTitle>
          </div>
          {isEditMode && (
            <Button
              size="sm"
              onClick={() => setAddJobLineDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Job Line
            </Button>
          )}
        </div>
        
        {jobLines.length > 0 && (
          <div className="flex gap-4 text-sm text-slate-600">
            <span>Total Lines: {jobLines.length}</span>
            <span>Total Value: ${calculateTotal().toFixed(2)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {jobLines.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <Grid3X3 className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 mb-4">No job lines added yet</p>
            {isEditMode ? (
              <p className="text-sm text-slate-400">
                Add job lines to break down the work order into specific tasks
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Job lines will appear here when added in edit mode
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {jobLines.map((jobLine) => (
              <JobLineCard
                key={jobLine.id}
                jobLine={jobLine}
                onUpdate={handleJobLineUpdated}
                onDelete={handleJobLineDeleted}
                onRemovePart={onRemovePart}
                isEditMode={isEditMode}
              />
            ))}
          </div>
        )}
      </CardContent>

      {isEditMode && (
        <AddJobLineDialog
          workOrderId={workOrderId}
          onJobLineAdded={handleJobLineAdded}
          open={addJobLineDialogOpen}
          onOpenChange={setAddJobLineDialogOpen}
        />
      )}
    </Card>
  );
}
