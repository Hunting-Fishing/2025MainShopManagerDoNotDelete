
import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { JobLineCard } from './JobLineCard';
import { useJobLineParts } from '@/hooks/useJobLineParts';

interface JobLinesGridProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (updatedJobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function JobLinesGrid({ 
  workOrderId, 
  jobLines, 
  onJobLinesChange, 
  isEditMode 
}: JobLinesGridProps) {
  const { updatePartJobLine } = useJobLineParts(workOrderId);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // Extract job line ID from droppable ID
    const targetJobLineId = over.id.replace('job-line-', '');
    const draggedPart = active.data.current?.part as WorkOrderPart;
    
    if (!draggedPart || !targetJobLineId) return;

    try {
      await updatePartJobLine(draggedPart.id, targetJobLineId);
      
      // Update local state by moving the part between job lines
      const updatedJobLines = jobLines.map(jobLine => {
        // Remove part from current job line
        if (jobLine.parts?.some(p => p.id === draggedPart.id)) {
          return {
            ...jobLine,
            parts: jobLine.parts?.filter(p => p.id !== draggedPart.id) || []
          };
        }
        // Add part to target job line
        if (jobLine.id === targetJobLineId) {
          return {
            ...jobLine,
            parts: [...(jobLine.parts || []), { ...draggedPart, jobLineId: targetJobLineId }]
          };
        }
        return jobLine;
      });
      
      onJobLinesChange(updatedJobLines);
    } catch (error) {
      console.error('Failed to move part:', error);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {jobLines.map((jobLine) => (
          <JobLineCard 
            key={jobLine.id} 
            jobLine={jobLine}
            isEditMode={isEditMode}
            onPartsChange={(newParts) => {
              const updatedJobLines = jobLines.map(jl => 
                jl.id === jobLine.id ? { ...jl, parts: newParts } : jl
              );
              onJobLinesChange(updatedJobLines);
            }}
          />
        ))}
      </div>
    </DndContext>
  );
}
