
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
        className={`text-center py-8 px-4 text-muted-foreground border-2 border-dashed rounded-lg transition-all duration-300 ${
          isOver 
            ? 'border-primary bg-primary/20 text-primary scale-[1.02] shadow-lg' 
            : 'border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/10'
        } ${isEditMode ? 'min-h-[100px] cursor-pointer' : 'min-h-[80px]'}`}
      >
        {isEditMode ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <div className={`text-lg font-medium transition-all duration-200 ${
              isOver ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {isOver ? '📦 Drop part here' : '📋 No parts added yet'}
            </div>
            <p className={`text-sm transition-all duration-200 ${
              isOver ? 'text-primary/80' : 'text-muted-foreground/70'
            }`}>
              {isOver ? 'Release to add part to this job line' : 'Drag parts here or add new ones'}
            </p>
          </div>
        ) : (
          <div className="py-4">
            <span className="text-muted-foreground">No parts added yet</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-3 min-h-[100px] p-4 rounded-lg transition-all duration-300 ${
        isOver 
          ? 'bg-primary/10 border-2 border-dashed border-primary shadow-lg' 
          : 'bg-muted/10 border border-transparent hover:bg-muted/20'
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
        <div className="border-2 border-dashed border-primary rounded-lg p-6 bg-primary/10 animate-pulse">
          <p className="text-center text-primary font-medium text-lg">
            📦 Drop part here to add to this job line
          </p>
        </div>
      )}
    </div>
  );
}
