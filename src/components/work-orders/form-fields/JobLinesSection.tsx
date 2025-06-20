
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkOrderJobLine } from '@/types/jobLine';
import { AddJobLineDialog } from '../job-lines/AddJobLineDialog';
import { EditJobLineDialog } from '../job-lines/EditJobLineDialog';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface JobLinesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];  
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
  description?: string;
  shopId?: string;
}

export function JobLinesSection({
  workOrderId,
  jobLines,
  onJobLinesChange,
  isEditMode = false,
  description,
  shopId
}: JobLinesSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [deletingJobLineId, setDeletingJobLineId] = useState<string | null>(null);

  const handleJobLineAdd = (newJobLines: WorkOrderJobLine[]) => {
    const updatedJobLines = [...jobLines, ...newJobLines];
    onJobLinesChange(updatedJobLines);
    setShowAddDialog(false);
  };

  const handleEditJobLine = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
  };

  const handleUpdateJobLine = async (updatedJobLine: WorkOrderJobLine) => {
    try {
      const { error } = await supabase
        .from('work_order_job_lines')
        .update({
          name: updatedJobLine.name,
          category: updatedJobLine.category,
          subcategory: updatedJobLine.subcategory,
          description: updatedJobLine.description,
          estimated_hours: updatedJobLine.estimated_hours,
          labor_rate: updatedJobLine.labor_rate,
          labor_rate_type: updatedJobLine.labor_rate_type,
          total_amount: updatedJobLine.total_amount,
          status: updatedJobLine.status,
          notes: updatedJobLine.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedJobLine.id);

      if (error) {
        console.error('Error updating job line:', error);
        toast({
          title: "Error",
          description: "Failed to update job line",
          variant: "destructive"
        });
        return;
      }

      const updatedJobLines = jobLines.map(line => 
        line.id === updatedJobLine.id ? updatedJobLine : line
      );
      onJobLinesChange(updatedJobLines);
      setEditingJobLine(null);

      toast({
        title: "Success",
        description: "Job line updated successfully"
      });
    } catch (error) {
      console.error('Error updating job line:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJobLine = async (jobLineId: string) => {
    try {
      const { error } = await supabase
        .from('work_order_job_lines')
        .delete()
        .eq('id', jobLineId);

      if (error) {
        console.error('Error deleting job line:', error);
        toast({
          title: "Error",
          description: "Failed to delete job line",
          variant: "destructive"
        });
        return;
      }

      const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
      onJobLinesChange(updatedJobLines);
      setDeletingJobLineId(null);

      toast({
        title: "Success",
        description: "Job line deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting job line:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'on-hold': return 'destructive';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Labor & Job Lines ({jobLines.length})</CardTitle>
            {isEditMode && (
              <Button
                size="sm"
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Labor
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {jobLines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No labor items added to this work order.
              {isEditMode && (
                <div className="mt-4">
                  <Button onClick={() => setShowAddDialog(true)}>
                    Add Your First Labor Item
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {jobLines.map((jobLine) => (
                <div key={jobLine.id} className="p-4 border rounded-lg bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900">{jobLine.name}</h4>
                        <Badge variant={getStatusBadgeVariant(jobLine.status || 'pending')}>
                          {jobLine.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        {jobLine.category && (
                          <p><strong>Category:</strong> {jobLine.category}</p>
                        )}
                        {jobLine.description && (
                          <p><strong>Description:</strong> {jobLine.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{jobLine.estimated_hours || 0} hours</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${jobLine.labor_rate || 0}/hr</span>
                          </div>
                        </div>
                        {jobLine.notes && (
                          <p><strong>Notes:</strong> {jobLine.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 mb-2">
                        ${(jobLine.total_amount || 0).toFixed(2)}
                      </p>
                      {isEditMode && (
                        <div className="flex items-center gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditJobLine(jobLine)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingJobLineId(jobLine.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddJobLineDialog
        workOrderId={workOrderId}
        onJobLineAdd={handleJobLineAdd}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <EditJobLineDialog
        jobLine={editingJobLine}
        open={!!editingJobLine}
        onOpenChange={(open) => !open && setEditingJobLine(null)}
        onSave={handleUpdateJobLine}
      />

      <AlertDialog open={!!deletingJobLineId} onOpenChange={() => setDeletingJobLineId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Line</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job line? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingJobLineId && handleDeleteJobLine(deletingJobLineId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
