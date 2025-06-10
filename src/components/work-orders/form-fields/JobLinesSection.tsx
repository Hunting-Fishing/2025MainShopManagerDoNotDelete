import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3X3 } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { toast } from 'sonner';

interface JobLinesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  loading?: boolean;
  isEditMode?: boolean;
}

export function JobLinesSection({
  workOrderId,
  jobLines,
  onJobLinesChange,
  loading = false,
  isEditMode = false
}: JobLinesSectionProps) {
  const handleUpdateJobLine = useCallback(
    async (updatedJobLine: WorkOrderJobLine) => {
      const updatedLines = jobLines.map((line) =>
        line.id === updatedJobLine.id ? updatedJobLine : line
      );
      onJobLinesChange(updatedLines);
    },
    [jobLines, onJobLinesChange]
  );

  const handleDeleteJobLine = useCallback(
    async (jobLineId: string) => {
      const updatedLines = jobLines.filter((line) => line.id !== jobLineId);
      onJobLinesChange(updatedLines);
    },
    [jobLines, onJobLinesChange]
  );

  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Job Lines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading job lines...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Lines Grid */}
      <JobLinesGrid
        workOrderId={workOrderId}
        jobLines={jobLines}
        onUpdate={handleUpdateJobLine}
        onDelete={handleDeleteJobLine}
        isEditMode={isEditMode}
      />

      {/* Debug Info */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="border p-4 rounded-md bg-gray-50">
          <h4 className="text-sm font-bold mb-2">Debug: Job Lines Data</h4>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(jobLines, null, 2)}
          </pre>
        </div>
      )} */}
    </div>
  );
}
