
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { JobLineCard } from './JobLineCard';
import { AddJobLineDialog } from './AddJobLineDialog';

interface JobLinesGridProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete: (jobLineId: string) => void;
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
}

export function JobLinesGrid({
  workOrderId,
  jobLines,
  onUpdate,
  onDelete,
  onJobLinesChange,
  isEditMode = false
}: JobLinesGridProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddJobLine = (newJobLine: WorkOrderJobLine) => {
    const updatedJobLines = [...jobLines, newJobLine];
    onJobLinesChange(updatedJobLines);
    setShowAddDialog(false);
  };

  const handlePartsChange = (newParts: WorkOrderPart[]) => {
    // Handle parts change if needed
    console.log('Parts changed:', newParts);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Labor & Services</CardTitle>
          {isEditMode && (
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Job Line
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {jobLines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No job lines added yet</p>
            {isEditMode && (
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Job Line
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobLines.map((jobLine) => (
              <JobLineCard
                key={jobLine.id}
                jobLine={jobLine}
                onEdit={onUpdate}
                onDelete={onDelete}
                onPartsChange={handlePartsChange}
                isEditMode={isEditMode}
              />
            ))}
          </div>
        )}
      </CardContent>

      {showAddDialog && (
        <AddJobLineDialog
          workOrderId={workOrderId}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAdd={handleAddJobLine}
        />
      )}
    </Card>
  );
}
