
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { JobLineCard } from './JobLineCard';
import { DraggablePartCard } from '../parts/DraggablePartCard';
import { AddJobLineDialog } from './AddJobLineDialog';
import { toast } from 'sonner';

interface JobLinesGridProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
}

export function JobLinesGrid({
  workOrderId,
  jobLines,
  onUpdate,
  onDelete,
  onJobLinesChange,
  isEditMode = false
}: JobLinesGridProps) {
  const [addJobLineDialogOpen, setAddJobLineDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedPart, setDraggedPart] = useState<WorkOrderPart | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    if (active.data.current?.type === 'part') {
      setDraggedPart(active.data.current.part);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedPart(null);

    if (!over || !active.data.current?.type === 'part') return;

    const draggedPart = active.data.current.part as WorkOrderPart;
    const targetJobLineId = over.data.current?.jobLineId;

    if (!targetJobLineId || draggedPart.jobLineId === targetJobLineId) return;

    // Move part to new job line
    const updatedJobLines = jobLines.map(jobLine => {
      if (jobLine.id === draggedPart.jobLineId) {
        // Remove part from source job line
        return {
          ...jobLine,
          parts: (jobLine.parts || []).filter(part => part.id !== draggedPart.id)
        };
      } else if (jobLine.id === targetJobLineId) {
        // Add part to target job line
        const updatedPart = { ...draggedPart, jobLineId: targetJobLineId };
        return {
          ...jobLine,
          parts: [...(jobLine.parts || []), updatedPart]
        };
      }
      return jobLine;
    });

    if (onJobLinesChange) {
      onJobLinesChange(updatedJobLines);
    }

    toast.success('Part moved successfully');
  };

  const handlePartsChange = (jobLineId: string, updatedParts: WorkOrderPart[]) => {
    const updatedJobLines = jobLines.map(jobLine => 
      jobLine.id === jobLineId 
        ? { ...jobLine, parts: updatedParts }
        : jobLine
    );
    
    if (onJobLinesChange) {
      onJobLinesChange(updatedJobLines);
    }
  };

  const handleAddJobLines = (newJobLinesData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const newJobLines: WorkOrderJobLine[] = newJobLinesData.map(jobLineData => ({
      ...jobLineData,
      id: `temp-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parts: []
    }));

    const updatedJobLines = [...jobLines, ...newJobLines];
    if (onJobLinesChange) {
      onJobLinesChange(updatedJobLines);
    }
    setAddJobLineDialogOpen(false);
  };

  const totalJobLines = jobLines.length;
  const totalParts = jobLines.reduce((total, jobLine) => total + (jobLine.parts?.length || 0), 0);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Job Lines</CardTitle>
              <Badge variant="secondary">{totalJobLines}</Badge>
              {totalParts > 0 && (
                <Badge variant="outline">{totalParts} parts</Badge>
              )}
            </div>
            {isEditMode && (
              <Button
                size="sm"
                onClick={() => setAddJobLineDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Job Line
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {jobLines.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
              <Package className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500 mb-4">No job lines added yet</p>
              {isEditMode ? (
                <p className="text-sm text-slate-400">
                  Add job lines to organize work and track parts
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  Job lines will appear here when added in edit mode
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {jobLines.map((jobLine) => (
                <JobLineCard
                  key={jobLine.id}
                  jobLine={jobLine}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  isEditMode={isEditMode}
                  onPartsChange={handlePartsChange}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DragOverlay>
        {draggedPart && (
          <DraggablePartCard
            part={draggedPart}
            isEditMode={true}
          />
        )}
      </DragOverlay>

      <AddJobLineDialog 
        workOrderId={workOrderId}
        onJobLineAdd={handleAddJobLines}
        open={addJobLineDialogOpen}
        onOpenChange={setAddJobLineDialogOpen}
      />
    </DndContext>
  );
}
