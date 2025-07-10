
import React, { useState, useEffect } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { AddJobLineDialog } from './AddJobLineDialog';
import { CompactJobLinesTable } from './CompactJobLinesTable';
import { generateTempJobLineId } from '@/services/jobLineParserEnhanced';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    setLocalJobLines(jobLines);
  }, [jobLines]);

  // Updated to handle array of job lines properly
  const handleAddJobLines = (newJobLinesData: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => {
    const newJobLines: WorkOrderJobLine[] = newJobLinesData.map(jobLineData => ({
      ...jobLineData,
      id: generateTempJobLineId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const updatedJobLines = [...localJobLines, ...newJobLines];
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  const handleUpdateJobLine = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = localJobLines.map(jobLine =>
      jobLine.id === updatedJobLine.id ? {
        ...updatedJobLine,
        updated_at: new Date().toISOString()
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

  const handleAddSingleJobLine = (jobLineData: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>) => {
    const newJobLine: WorkOrderJobLine = {
      ...jobLineData,
      id: generateTempJobLineId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedJobLines = [...localJobLines, newJobLine];
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">Job Lines</h3>
      </div>

      <CompactJobLinesTable
        jobLines={localJobLines}
        allParts={[]}
        onUpdate={handleUpdateJobLine}
        onDelete={handleDeleteJobLine}
        onAddJobLine={handleAddSingleJobLine}
        workOrderId={workOrderId}
        isEditMode={true}
      />

      {showAddDialog && (
        <AddJobLineDialog 
          workOrderId={workOrderId}
          onJobLineAdd={handleAddJobLines}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      )}
    </div>
  );
}
