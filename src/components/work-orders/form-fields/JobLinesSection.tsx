import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddJobLineDialog } from '../job-lines/AddJobLineDialog';
import { UnifiedJobLineFormDialog } from '../job-lines/UnifiedJobLineFormDialog';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';
import { ConfirmDeleteDialog } from '../shared/ConfirmDeleteDialog';
import { toast } from '@/hooks/use-toast';
interface JobLinesSectionProps {
  workOrderId: string;
  description?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: () => Promise<void>;
  isEditMode: boolean;
  shopId?: string;
  selectedServicesCount?: number;
}
export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  isEditMode,
  shopId,
  selectedServicesCount = 0
}: JobLinesSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [deletingJobLine, setDeletingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleAddJobLine = () => {
    setShowAddDialog(true);
  };

  // Removed custom edit handler to let CompactJobLinesTable use its focused edit dialog

  const handleJobLineAdd = async (jobLines: WorkOrderJobLine[]) => {
    await onJobLinesChange();
    setShowAddDialog(false);
  };
  const handleJobLineSave = async (jobLines: WorkOrderJobLine[]) => {
    await onJobLinesChange();
    setEditingJobLine(null);
  };
  const handleDeleteJobLine = async (jobLineId: string) => {
    const jobLineToDelete = jobLines.find(line => line.id === jobLineId);
    if (!jobLineToDelete) {
      console.error('Job line not found:', jobLineId);
      return;
    }
    setDeletingJobLine(jobLineToDelete);
  };
  const confirmDeleteJobLine = async () => {
    if (!deletingJobLine) return;
    setIsDeleting(true);
    try {
      // Import the delete function
      const {
        deleteWorkOrderJobLine
      } = await import('@/services/workOrder/jobLinesService');
      console.log('Deleting job line:', deletingJobLine.id);
      await deleteWorkOrderJobLine(deletingJobLine.id);
      console.log('Job line deleted successfully, refreshing list');
      await onJobLinesChange();

      // Show success message
      toast({
        title: "Success",
        description: "Job line deleted successfully"
      });
      setDeletingJobLine(null);
    } catch (error) {
      console.error('Error deleting job line:', error);

      // Show error message
      toast({
        title: "Error",
        description: "Failed to delete job line. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  return <Card className="bg-green-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Labor & Services
          {selectedServicesCount > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({selectedServicesCount} from service selection + {jobLines.length - selectedServicesCount} manual)
            </span>}
        </CardTitle>
        {isEditMode && <Button onClick={handleAddJobLine} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Manual Job Line
          </Button>}
      </CardHeader>
      
      <CardContent>
        {jobLines.length > 0 ? <CompactJobLinesTable jobLines={jobLines} onUpdate={onJobLinesChange} onDelete={isEditMode ? handleDeleteJobLine : undefined} isEditMode={isEditMode} /> : <div className="text-center py-8 text-gray-500">
            {isEditMode ? "No services selected and no manual job lines added yet. Select services above or click 'Add Manual Job Line' to get started." : "No job lines configured for this work order."}
          </div>}
      </CardContent>

      {/* Add Job Line Dialog - Uses comprehensive form with service/manual options */}
      <AddJobLineDialog workOrderId={workOrderId} onJobLineAdd={handleJobLineAdd} open={showAddDialog} onOpenChange={setShowAddDialog} />

      {/* Edit dialog is now handled by CompactJobLinesTable using UnifiedJobLineEditDialog */}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog open={!!deletingJobLine} onOpenChange={open => !open && setDeletingJobLine(null)} onConfirm={confirmDeleteJobLine} title="Delete Job Line" description="Are you sure you want to delete this job line? This action cannot be undone and will also remove any associated parts." itemName={deletingJobLine?.name} isDeleting={isDeleting} />
    </Card>;
}