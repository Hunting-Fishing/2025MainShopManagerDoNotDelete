
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderJobLine } from '@/types/jobLine';
import { AddJobLineDialog } from '../job-lines/AddJobLineDialog';
import { JobLineCard } from '../job-lines/JobLineCard';
import { Wrench } from 'lucide-react';

interface JobLinesSectionProps {
  workOrderId: string;
  description: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  shopId?: string;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  shopId
}: JobLinesSectionProps) {
  const [localJobLines, setLocalJobLines] = useState<WorkOrderJobLine[]>(jobLines);

  // Sync with parent state
  useEffect(() => {
    setLocalJobLines(jobLines);
  }, [jobLines]);

  const handleAddJobLine = (newJobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJobLine: WorkOrderJobLine = {
      ...newJobLineData,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedJobLines = [...localJobLines, newJobLine];
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  const handleUpdateJobLine = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = localJobLines.map(jobLine =>
      jobLine.id === updatedJobLine.id ? updatedJobLine : jobLine
    );
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    const updatedJobLines = localJobLines.filter(jobLine => jobLine.id !== jobLineId);
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  const totalEstimatedHours = localJobLines.reduce((total, jobLine) => 
    total + (jobLine.estimatedHours || 0), 0
  );

  const totalAmount = localJobLines.reduce((total, jobLine) => 
    total + (jobLine.totalAmount || 0), 0
  );

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Job Lines</CardTitle>
            <Badge variant="secondary">{localJobLines.length}</Badge>
          </div>
          <AddJobLineDialog 
            workOrderId={workOrderId}
            onJobLineAdd={handleAddJobLine}
          />
        </div>
        
        {localJobLines.length > 0 && (
          <div className="flex gap-4 text-sm text-slate-600">
            <span>Total Hours: {totalEstimatedHours.toFixed(1)}</span>
            <span>Total Amount: ${totalAmount.toFixed(2)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {localJobLines.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <Wrench className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 mb-4">No job lines added yet</p>
            <p className="text-sm text-slate-400">
              Add job lines to break down the work into specific tasks
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {localJobLines.map((jobLine) => (
              <JobLineCard
                key={jobLine.id}
                jobLine={jobLine}
                onUpdate={handleUpdateJobLine}
                onDelete={handleDeleteJobLine}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
