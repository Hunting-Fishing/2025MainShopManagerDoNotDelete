
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { JobLineEditDialog } from './JobLineEditDialog';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { EditPartDialog } from '../parts/EditPartDialog';
import { deleteWorkOrderJobLine, updateWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { useToast } from '@/hooks/use-toast';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  isEditMode?: boolean;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsChange?: (newParts: WorkOrderPart[]) => void;
}

export function JobLineCard({
  jobLine,
  isEditMode = false,
  onUpdate,
  onDelete,
  onPartsChange
}: JobLineCardProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPartsDialogOpen, setIsAddPartsDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      const success = await deleteWorkOrderJobLine(jobLine.id);
      if (success) {
        onDelete(jobLine.id);
        toast({
          title: "Job line deleted",
          description: "The job line has been successfully deleted.",
        });
      } else {
        throw new Error('Failed to delete job line');
      }
    } catch (error) {
      console.error('Error deleting job line:', error);
      toast({
        title: "Error",
        description: "Failed to delete job line. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (updatedJobLine: WorkOrderJobLine) => {
    try {
      console.log('Saving job line updates:', updatedJobLine);
      const success = await updateWorkOrderJobLine(jobLine.id, {
        name: updatedJobLine.name,
        description: updatedJobLine.description,
        estimatedHours: updatedJobLine.estimatedHours,
        laborRate: updatedJobLine.laborRate,
        notes: updatedJobLine.notes, // Make sure notes are included
        status: updatedJobLine.status,
        category: updatedJobLine.category,
        subcategory: updatedJobLine.subcategory,
        totalAmount: updatedJobLine.totalAmount
      });
      
      if (success && onUpdate) {
        console.log('Job line updated successfully, calling onUpdate');
        onUpdate(updatedJobLine);
        toast({
          title: "Job line updated",
          description: "The job line has been successfully updated.",
        });
      } else {
        throw new Error('Failed to update job line');
      }
    } catch (error) {
      console.error('Error updating job line:', error);
      toast({
        title: "Error",
        description: "Failed to update job line. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePart = async (partId: string) => {
    try {
      const success = await deleteWorkOrderPart(partId);
      if (success && onPartsChange && jobLine.parts) {
        const updatedParts = jobLine.parts.filter(part => part.id !== partId);
        onPartsChange(updatedParts);
        toast({
          title: "Part removed",
          description: "The part has been successfully removed.",
        });
      }
    } catch (error) {
      console.error('Error removing part:', error);
      toast({
        title: "Error",
        description: "Failed to remove part. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPart(part);
  };

  const handlePartsAdded = () => {
    // Refresh parts data after adding
    if (onPartsChange && jobLine.parts) {
      // This will trigger a re-fetch of parts in the parent component
      onPartsChange([...jobLine.parts]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">{jobLine.name}</CardTitle>
              <Badge className={getStatusColor(jobLine.status)}>
                {jobLine.status}
              </Badge>
            </div>
            {isEditMode && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {jobLine.description && (
            <p className="text-sm text-muted-foreground">{jobLine.description}</p>
          )}
          {jobLine.notes && (
            <div className="text-sm">
              <span className="font-medium">Notes: </span>
              <span className="text-muted-foreground">{jobLine.notes}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Hours:</span> {jobLine.estimatedHours || 0}
              </div>
              <div>
                <span className="font-medium">Rate:</span> ${jobLine.laborRate || 0}
              </div>
              <div>
                <span className="font-medium">Total:</span> ${jobLine.totalAmount || 0}
              </div>
              <div>
                <span className="font-medium">Parts:</span> {jobLine.parts?.length || 0}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Parts</h4>
                {isEditMode && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAddPartsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Parts
                  </Button>
                )}
              </div>
              <DroppableJobLinePartsSection
                jobLineId={jobLine.id}
                parts={jobLine.parts || []}
                onRemovePart={isEditMode ? handleRemovePart : undefined}
                onEditPart={isEditMode ? handleEditPart : undefined}
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <JobLineEditDialog
        jobLine={jobLine}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />

      <AddPartsDialog
        workOrderId={jobLine.workOrderId || ''}
        jobLineId={jobLine.id}
        onPartsAdd={handlePartsAdded}
        open={isAddPartsDialogOpen}
        onOpenChange={setIsAddPartsDialogOpen}
      />

      {editingPart && (
        <EditPartDialog
          open={!!editingPart}
          onOpenChange={(open) => !open && setEditingPart(null)}
          part={editingPart}
          onSave={() => {
            setEditingPart(null);
            handlePartsAdded();
          }}
        />
      )}
    </>
  );
}
