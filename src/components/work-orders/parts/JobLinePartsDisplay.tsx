
import React from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { PartDetailsCard } from './PartDetailsCard';
import { deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface JobLinePartsDisplayProps {
  parts: WorkOrderPart[];
  onRemovePart?: (partId: string) => void;
  onEditPart?: (part: WorkOrderPart) => void;
  isEditMode?: boolean;
}

export const JobLinePartsDisplay: React.FC<JobLinePartsDisplayProps> = ({
  parts,
  onRemovePart,
  onEditPart,
  isEditMode = false
}) => {
  const handleRemovePart = async (partId: string) => {
    if (window.confirm('Are you sure you want to remove this part?')) {
      try {
        const success = await deleteWorkOrderPart(partId);
        if (success) {
          onRemovePart?.(partId);
          toast.success('Part removed successfully');
        } else {
          toast.error('Failed to remove part');
        }
      } catch (error) {
        console.error('Error removing part:', error);
        toast.error('Failed to remove part');
      }
    }
  };

  if (parts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No parts available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {parts.map((part) => (
        <PartDetailsCard
          key={part.id}
          part={part}
          onRemove={handleRemovePart}
          onEdit={onEditPart}
          isEditMode={isEditMode}
        />
      ))}
    </div>
  );
};
