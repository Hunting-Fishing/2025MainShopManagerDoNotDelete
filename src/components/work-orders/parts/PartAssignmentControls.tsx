
import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PartsAssignmentDialog } from './PartsAssignmentDialog';
import { EditPartDialog } from './EditPartDialog';
import { ArrowRight, Edit, Trash2, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PartAssignmentControlsProps {
  part: WorkOrderPart;
  jobLines: WorkOrderJobLine[];
  onPartUpdate?: (updatedPart: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
  onPartAssigned?: () => void;
}

export function PartAssignmentControls({
  part,
  jobLines,
  onPartUpdate,
  onPartDelete,
  onPartAssigned
}: PartAssignmentControlsProps) {
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleQuickAssign = async (jobLineId: string) => {
    if (!onPartUpdate) return;
    
    setIsAssigning(true);
    try {
      const updatedPart = { ...part, job_line_id: jobLineId };
      await onPartUpdate(updatedPart);
      
      const jobLine = jobLines.find(jl => jl.id === jobLineId);
      toast({
        title: "Part Assigned",
        description: `${part.name} assigned to ${jobLine?.name || 'job line'}`,
      });
      
      if (onPartAssigned) {
        onPartAssigned();
      }
    } catch (error) {
      console.error('Error assigning part:', error);
      toast({
        title: "Error",
        description: "Failed to assign part",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!onPartDelete) return;
    
    if (confirm(`Are you sure you want to delete ${part.name}?`)) {
      try {
        await onPartDelete(part.id);
        toast({
          title: "Part Deleted",
          description: `${part.name} has been removed`,
        });
      } catch (error) {
        console.error('Error deleting part:', error);
        toast({
          title: "Error",
          description: "Failed to delete part",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Quick Assignment Dropdown */}
        <div className="flex items-center gap-2">
          <Select onValueChange={handleQuickAssign} disabled={isAssigning}>
            <SelectTrigger className="w-48 h-8">
              <SelectValue placeholder="Assign to job line..." />
            </SelectTrigger>
            <SelectContent>
              {jobLines.map((jobLine) => (
                <SelectItem key={jobLine.id} value={jobLine.id}>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    {jobLine.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2"
            onClick={() => setShowAssignmentDialog(true)}
          >
            <User className="h-3 w-3 mr-1" />
            Assign
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-red-600 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Assignment Dialog */}
      <PartsAssignmentDialog
        open={showAssignmentDialog}
        onClose={() => setShowAssignmentDialog(false)}
        parts={[part]}
        jobLines={jobLines}
        onPartsAssigned={(assignedParts) => {
          if (onPartAssigned) {
            onPartAssigned();
          }
          setShowAssignmentDialog(false);
        }}
      />

      {/* Edit Dialog */}
      <EditPartDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        part={part}
        jobLines={jobLines}
        onPartUpdated={() => {
          if (onPartAssigned) {
            onPartAssigned();
          }
          setShowEditDialog(false);
        }}
      />
    </>
  );
}
