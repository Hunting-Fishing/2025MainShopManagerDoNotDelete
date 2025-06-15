import React, { useState, useEffect } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { AddJobLineDialog } from './AddJobLineDialog';
import { JobLineCard } from './JobLineCard';
import { generateTempJobLineId } from '@/services/jobLineParserEnhanced';

interface EditableJobLinesGridProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
}

export function EditableJobLinesGrid({
  workOrderId,
  jobLines,
  onJobLinesChange
}: EditableJobLinesGridProps) {
  const [localJobLines, setLocalJobLines] = useState<WorkOrderJobLine[]>(jobLines);

  useEffect(() => {
    setLocalJobLines(jobLines);
  }, [jobLines]);

  const handleAddJobLines = (newJobLinesData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const newJobLines: WorkOrderJobLine[] = newJobLinesData.map(jobLineData => ({
      ...jobLineData,
      id: generateTempJobLineId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const updatedJobLines = [...localJobLines, ...newJobLines];
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  const handleUpdateJobLine = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = localJobLines.map(jobLine =>
      jobLine.id === updatedJobLine.id ? {
        ...updatedJobLine,
        updatedAt: new Date().toISOString()
      } : jobLine
    );
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    const updatedJobLines = localJobLines.filter(jobLine => jobLine.id !== jobLineId);
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  const handlePartsChange = (jobLineId: string, newParts: any[]) => {
    const updatedJobLines = localJobLines.map(jobLine =>
      jobLine.id === jobLineId ? { ...jobLine, parts: newParts } : jobLine
    );
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Job Lines</h3>
        <AddJobLineDialog 
          workOrderId={workOrderId}
          onJobLineAdd={handleAddJobLines}
        />
      </div>

      <div className="grid gap-4">
        {localJobLines.map((jobLine) => (
          <JobLineCard
            key={jobLine.id}
            jobLine={jobLine}
            onUpdate={handleUpdateJobLine}
            onDelete={handleDeleteJobLine}
            isEditMode={true}
          />
        ))}
      </div>

      {localJobLines.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">No job lines added yet</p>
          <p className="text-sm text-slate-400">Click "Add Job Line" to get started</p>
        </div>
      )}
    </div>
  );
}
