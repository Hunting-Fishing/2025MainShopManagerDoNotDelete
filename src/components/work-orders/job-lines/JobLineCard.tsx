
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineDialog } from './JobLineDialog';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { updateWorkOrderJobLine, deleteWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { toast } from 'sonner';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsChange?: (newParts: any[]) => void;
  isEditMode?: boolean;
}

export function JobLineCard({ 
  jobLine, 
  onUpdate,
  onDelete,
  onPartsChange,
  isEditMode = false 
}: JobLineCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddPartsDialog, setShowAddPartsDialog] = useState(false);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleSave = async (updatedJobLine: WorkOrderJobLine) => {
    try {
      console.log('Saving job line with data:', updatedJobLine);
      
      // Call the update service with the complete updated job line data
      await updateWorkOrderJobLine(updatedJobLine.id, {
        name: updatedJobLine.name,
        description: updatedJobLine.description,
        estimatedHours: updatedJobLine.estimatedHours,
        laborRate: updatedJobLine.laborRate,
        totalAmount: updatedJobLine.totalAmount,
        status: updatedJobLine.status,
        notes: updatedJobLine.notes, // Ensure notes are included
        category: updatedJobLine.category,
        subcategory: updatedJobLine.subcategory
      });

      console.log('Job line updated successfully');
      toast.success('Job line updated successfully');
      
      if (onUpdate) {
        onUpdate(updatedJobLine);
      }
    } catch (error) {
      console.error('Error updating job line:', error);
      toast.error('Failed to update job line');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job line?')) return;
    
    try {
      await deleteWorkOrderJobLine(jobLine.id);
      toast.success('Job line deleted successfully');
      
      if (onDelete) {
        onDelete(jobLine.id);
      }
    } catch (error) {
      console.error('Error deleting job line:', error);
      toast.error('Failed to delete job line');
    }
  };

  const handlePartsAdd = () => {
    // Refresh parts when new parts are added
    if (onPartsChange) {
      // This will trigger a refresh of the parts in the parent component
      onPartsChange(jobLine.parts || []);
    }
    setShowAddPartsDialog(false);
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{jobLine.name}</h3>
                <Badge variant="outline">{jobLine.status}</Badge>
              </div>
              {jobLine.description && (
                <p className="text-sm text-muted-foreground mb-2">{jobLine.description}</p>
              )}
              {jobLine.notes && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted-foreground">Internal Notes:</p>
                  <p className="text-sm text-muted-foreground">{jobLine.notes}</p>
                </div>
              )}
            </div>
            {isEditMode && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPartsDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Parts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Estimated Hours</p>
              <p className="text-sm">{jobLine.estimatedHours || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Labor Rate</p>
              <p className="text-sm">${jobLine.laborRate || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total</p>
              <p className="text-sm font-semibold">${jobLine.totalAmount || 0}</p>
            </div>
          </div>

          <DroppableJobLinePartsSection
            jobLine={jobLine}
            onPartsChange={onPartsChange}
          />
        </CardContent>
      </Card>

      <JobLineDialog
        jobLine={jobLine}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSave}
      />

      <AddPartsDialog
        workOrderId={jobLine.workOrderId || ''}
        jobLineId={jobLine.id}
        onPartsAdd={handlePartsAdd}
        open={showAddPartsDialog}
        onOpenChange={setShowAddPartsDialog}
      />
    </>
  );
}
