import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WorkOrderJobLine, jobLineStatusMap } from '@/types/jobLine';
import { JobLineDialog } from './JobLineDialog';
import { useToast } from '@/components/ui/use-toast';
import { useJobLines } from '@/hooks/useJobLines';
import { WorkOrderPart } from '@/types/workOrderPart';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { EditPartDialog } from '../parts/EditPartDialog';
import { useParts } from '@/hooks/useParts';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  isEditMode: boolean;
  onPartsChange: (newParts: WorkOrderPart[]) => void;
}

export function JobLineCard({ jobLine, isEditMode, onPartsChange }: JobLineCardProps) {
  const [open, setOpen] = useState(false);
  const [editPartDialogOpen, setEditPartDialogOpen] = useState(false);
  const [partToEdit, setPartToEdit] = useState<WorkOrderPart | null>(null);
  const { toast } = useToast();
  const { deleteJobLine } = useJobLines(jobLine.workOrderId || '');
  const { parts, isLoading, error, refetch: refetchParts } = useParts(jobLine.workOrderId || '', jobLine.id);

  const handlePartsUpdate = () => {
    // Refresh the parts data after update
    refetchParts();
    // Call the callback with updated parts
    if (parts) {
      onPartsChange(parts);
    }
  };

  const handleEdit = () => {
    setOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteJobLine(jobLine.id);
      toast({
        title: 'Job Line Deleted',
        description: 'The job line has been successfully deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error Deleting Job Line',
        description: error.message || 'Failed to delete the job line. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemovePart = async (partId: string) => {
    try {
      // Optimistically update the UI
      const updatedParts = parts ? parts.filter((part) => part.id !== partId) : [];
      onPartsChange(updatedParts);
      refetchParts();

      toast({
        title: 'Part Removed',
        description: 'The part has been successfully removed from the job line.',
      });
    } catch (error: any) {
      toast({
        title: 'Error Removing Part',
        description: error.message || 'Failed to remove the part. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setPartToEdit(part);
    setEditPartDialogOpen(true);
  };

  const handleCloseEditPartDialog = () => {
    setPartToEdit(null);
    setEditPartDialogOpen(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold">{jobLine.name}</CardTitle>
            <CardDescription>
              {jobLine.description || 'No description provided'}
            </CardDescription>
          </div>
          {isEditMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-slate-600">Category:</span>
            <div className="text-slate-900">{jobLine.category || 'N/A'}</div>
          </div>
          <div>
            <span className="font-medium text-slate-600">Subcategory:</span>
            <div className="text-slate-900">{jobLine.subcategory || 'N/A'}</div>
          </div>
          <div>
            <span className="font-medium text-slate-600">Estimated Hours:</span>
            <div className="text-slate-900">{jobLine.estimatedHours || 'N/A'}</div>
          </div>
          <div>
            <span className="font-medium text-slate-600">Labor Rate:</span>
            <div className="text-slate-900">{jobLine.laborRate || 'N/A'}</div>
          </div>
          <div>
            <span className="font-medium text-slate-600">Status:</span>
            <Badge className={jobLineStatusMap[jobLine.status]?.classes || 'bg-gray-100 text-gray-800'}>
              {jobLineStatusMap[jobLine.status]?.label || jobLine.status}
            </Badge>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium">Parts</h4>
            {isEditMode && (
              <AddPartsDialog 
                workOrderId={jobLine.workOrderId || ''}
                jobLineId={jobLine.id}
                onPartAdded={handlePartsUpdate}
              />
            )}
          </div>
          
          <DroppableJobLinePartsSection
            jobLineId={jobLine.id}
            parts={parts || []}
            onRemovePart={handleRemovePart}
            onEditPart={handleEditPart}
            isEditMode={isEditMode}
          />
        </div>
      </CardContent>

      <JobLineDialog open={open} setOpen={setOpen} jobLine={jobLine} />

      <EditPartDialog
        open={editPartDialogOpen}
        onOpenChange={setEditPartDialogOpen}
        part={partToEdit}
        onPartUpdated={handlePartsUpdate}
        onClose={handleCloseEditPartDialog}
      />
    </Card>
  );
}
