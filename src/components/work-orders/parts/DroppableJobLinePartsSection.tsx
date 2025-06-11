
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggablePartCard } from './DraggablePartCard';
import { WorkOrderPart } from '@/types/workOrderPart';

interface DroppableJobLinePartsSectionProps {
  jobLineId: string;
  parts: WorkOrderPart[];
  onRemovePart?: (partId: string) => void;
  onEditPart?: (part: WorkOrderPart) => void;
  isEditMode?: boolean;
}

export function DroppableJobLinePartsSection({
  jobLineId,
  parts,
  onRemovePart,
  onEditPart,
  isEditMode = false
}: DroppableJobLinePartsSectionProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `job-line-${jobLineId}`,
    data: {
      type: 'jobLine',
      jobLineId,
    },
  });

  if (parts.length === 0) {
    return (
      <div 
        ref={setNodeRef}
        className={`text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg transition-colors ${
          isOver ? 'border-primary bg-primary/5' : 'border-slate-200'
        } ${isEditMode ? 'min-h-[60px]' : ''}`}
      >
        {isEditMode ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm">No parts added yet</p>
            <p className="text-xs text-slate-400">Drag parts here or add new ones</p>
          </div>
        ) : (
          'No parts added yet'
        )}
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-3 min-h-[60px] p-2 rounded-lg transition-colors ${
        isOver ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
      }`}
    >
      {parts.map((part) => (
        <DraggablePartCard
          key={part.id}
          part={part}
          onRemovePart={onRemovePart}
          onEditPart={onEditPart}
          isEditMode={isEditMode}
        />
      ))}
    </div>
  );
}
