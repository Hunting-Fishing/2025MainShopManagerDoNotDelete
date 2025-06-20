
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { JobLineEditDialog } from '../job-lines/JobLineEditDialog';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';

interface JobLinesSectionProps {
  workOrderId: string;
  description?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: () => Promise<void>;
  isEditMode: boolean;
  shopId?: string;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  isEditMode,
  shopId
}: JobLinesSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);

  const handleAddJobLine = () => {
    setShowAddDialog(true);
  };

  const handleEditJobLine = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
  };

  const handleSaveJobLine = async (jobLine: WorkOrderJobLine) => {
    await onJobLinesChange();
    setShowAddDialog(false);
    setEditingJobLine(null);
  };

  const handleDeleteJobLine = async (jobLineId: string) => {
    // Delete logic would go here
    await onJobLinesChange();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Labor & Services</CardTitle>
        {isEditMode && (
          <Button
            onClick={handleAddJobLine}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Job Line
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {jobLines.length > 0 ? (
          <CompactJobLinesTable
            jobLines={jobLines}
            onEdit={isEditMode ? handleEditJobLine : undefined}
            onDelete={isEditMode ? handleDeleteJobLine : undefined}
            isEditMode={isEditMode}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            {isEditMode ? 
              "No job lines added yet. Click 'Add Job Line' to get started." :
              "No job lines configured for this work order."
            }
          </div>
        )}
      </CardContent>

      {/* Add Job Line Dialog */}
      <JobLineEditDialog
        jobLine={null}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleSaveJobLine}
      />

      {/* Edit Job Line Dialog */}
      <JobLineEditDialog
        jobLine={editingJobLine}
        open={!!editingJobLine}
        onOpenChange={(open) => !open && setEditingJobLine(null)}
        onSave={handleSaveJobLine}
      />
    </Card>
  );
}
