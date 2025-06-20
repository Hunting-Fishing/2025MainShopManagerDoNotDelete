
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { JobLineEditDialog } from '../job-lines/JobLineEditDialog';
import { UnifiedJobLineFormDialog } from '../job-lines/UnifiedJobLineFormDialog';
import { deleteJobLine, updateJobLine } from '@/services/workOrder/jobLinesService';
import { toast } from '@/hooks/use-toast';

interface JobLinesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: () => Promise<void>;
  isEditMode: boolean;
}

export function JobLinesSection({
  workOrderId,
  jobLines,
  onJobLinesChange,
  isEditMode
}: JobLinesSectionProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleEdit = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
  };

  const handleDelete = async (jobLineId: string) => {
    if (!confirm('Are you sure you want to delete this job line?')) return;
    
    try {
      await deleteJobLine(jobLineId);
      toast({
        title: "Success",
        description: "Job line deleted successfully",
      });
      await onJobLinesChange();
    } catch (error) {
      console.error('Error deleting job line:', error);
      toast({
        title: "Error",
        description: "Failed to delete job line",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (updatedJobLine: WorkOrderJobLine) => {
    try {
      await updateJobLine(updatedJobLine.id, updatedJobLine);
      toast({
        title: "Success",
        description: "Job line updated successfully",
      });
      setEditingJobLine(null);
      await onJobLinesChange();
    } catch (error) {
      console.error('Error updating job line:', error);
      toast({
        title: "Error",
        description: "Failed to update job line",
        variant: "destructive",
      });
    }
  };

  const handleAdd = async (newJobLines: WorkOrderJobLine[]) => {
    setShowAddDialog(false);
    await onJobLinesChange();
    toast({
      title: "Success",
      description: "Job line added successfully",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on-hold': 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Labor & Services</CardTitle>
        {isEditMode && (
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Job Line
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {jobLines.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No job lines added yet. {isEditMode && 'Click "Add Job Line" to get started.'}
          </p>
        ) : (
          <div className="space-y-4">
            {jobLines.map((jobLine) => (
              <div key={jobLine.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{jobLine.name}</h4>
                      <Badge className={getStatusBadgeColor(jobLine.status || 'pending')}>
                        {jobLine.status || 'pending'}
                      </Badge>
                    </div>
                    {jobLine.description && (
                      <p className="text-sm text-slate-600 mb-2">{jobLine.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-slate-600">
                      {jobLine.estimated_hours && (
                        <span>Hours: {jobLine.estimated_hours}</span>
                      )}
                      {jobLine.labor_rate && (
                        <span>Rate: ${jobLine.labor_rate}/hr</span>
                      )}
                      {jobLine.total_amount && (
                        <span className="font-semibold">Total: ${jobLine.total_amount}</span>
                      )}
                    </div>
                  </div>
                  
                  {isEditMode && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(jobLine)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(jobLine.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Job Line Dialog */}
      <JobLineEditDialog
        jobLine={editingJobLine}
        open={!!editingJobLine}
        onOpenChange={(open) => !open && setEditingJobLine(null)}
        onSave={handleSave}
      />

      {/* Add Job Line Dialog */}
      <UnifiedJobLineFormDialog
        workOrderId={workOrderId}
        mode="add"
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleAdd}
      />
    </Card>
  );
}
