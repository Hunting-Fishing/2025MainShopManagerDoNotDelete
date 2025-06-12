
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
        className={`text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg transition-all duration-200 ${
          isOver 
            ? 'border-primary bg-primary/10 text-primary' 
            : 'border-muted-foreground/20 hover:border-muted-foreground/40'
        } ${isEditMode ? 'min-h-[80px]' : 'min-h-[60px]'}`}
      >
        {isEditMode ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm font-medium">
              {isOver ? 'Drop part here' : 'No parts added yet'}
            </p>
            <p className="text-xs mt-1 opacity-70">
              {isOver ? '' : 'Drag parts here or add new ones'}
            </p>
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
      className={`space-y-3 min-h-[80px] p-3 rounded-lg transition-all duration-200 ${
        isOver 
          ? 'bg-primary/10 border-2 border-dashed border-primary' 
          : 'bg-muted/20'
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
      
      {isOver && (
        <div className="border-2 border-dashed border-primary rounded-lg p-4 bg-primary/5">
          <p className="text-center text-primary font-medium">Drop part here</p>
        </div>
      )}
    </div>
  );
}
