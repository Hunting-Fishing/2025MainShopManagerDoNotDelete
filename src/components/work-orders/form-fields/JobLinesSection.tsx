import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderJobLine } from '@/types/jobLine';
import { AddJobLineDialog } from '../job-lines/AddJobLineDialog';
import { JobLineCard } from '../job-lines/JobLineCard';
import { Wrench } from 'lucide-react';
import { generateTempJobLineId } from '@/services/jobLineService';

interface JobLinesSectionProps {
  workOrderId: string;
  description: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  shopId?: string;
  isEditMode?: boolean;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  shopId,
  isEditMode = false
}: JobLinesSectionProps) {
  const [localJobLines, setLocalJobLines] = useState<WorkOrderJobLine[]>(jobLines);

  // Sync with parent state
  useEffect(() => {
    console.log('JobLinesSection: Syncing job lines from props:', jobLines.length);
    setLocalJobLines(jobLines);
  }, [jobLines]);

  const handleAddJobLine = (newJobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Adding new job line:', newJobLineData);
    
    const newJobLine: WorkOrderJobLine = {
      ...newJobLineData,
      id: generateTempJobLineId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedJobLines = [...localJobLines, newJobLine];
    console.log('Updated job lines count:', updatedJobLines.length);
    
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  const handleUpdateJobLine = (updatedJobLine: WorkOrderJobLine) => {
    console.log('Updating job line:', updatedJobLine.id);
    
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
    console.log('Deleting job line:', jobLineId);
    
    const updatedJobLines = localJobLines.filter(jobLine => jobLine.id !== jobLineId);
    console.log('Job lines after deletion:', updatedJobLines.length);
    
    setLocalJobLines(updatedJobLines);
    onJobLinesChange(updatedJobLines);
  };

  const totalEstimatedHours = localJobLines.reduce((total, jobLine) => 
    total + (jobLine.estimatedHours || 0), 0
  );

  const totalAmount = localJobLines.reduce((total, jobLine) => 
    total + (jobLine.totalAmount || 0), 0
  );

  console.log('JobLinesSection rendering with job lines:', localJobLines.length);

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Job Lines</CardTitle>
            <Badge variant="secondary">{localJobLines.length}</Badge>
          </div>
          {isEditMode && (
            <AddJobLineDialog 
              workOrderId={workOrderId}
              onJobLineAdd={handleAddJobLine}
            />
          )}
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
            {isEditMode ? (
              <p className="text-sm text-slate-400">
                Add job lines to break down the work into specific tasks
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Job lines will appear here when added in edit mode
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {localJobLines.map((jobLine) => (
              <JobLineCard
                key={jobLine.id}
                jobLine={jobLine}
                onUpdate={handleUpdateJobLine}
                onDelete={handleDeleteJobLine}
                isEditMode={isEditMode}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
