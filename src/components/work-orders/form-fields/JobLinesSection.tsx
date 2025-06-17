
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';

interface JobLinesSectionProps {
  workOrderId: string;
  description?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onJobLineUpdate?: (updatedJobLine: WorkOrderJobLine) => Promise<void>;
  onJobLineDelete?: (jobLineId: string) => Promise<void>;
  isEditMode: boolean;
  shopId?: string;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  onJobLineUpdate,
  onJobLineDelete,
  isEditMode,
  shopId
}: JobLinesSectionProps) {
  const handleJobLineDelete = async (jobLineId: string) => {
    if (onJobLineDelete) {
      await onJobLineDelete(jobLineId);
    } else {
      const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
      onJobLinesChange(updatedJobLines);
    }
  };

  const handleJobLineUpdate = async (updatedJobLine: WorkOrderJobLine) => {
    if (onJobLineUpdate) {
      await onJobLineUpdate(updatedJobLine);
    } else {
      const updatedJobLines = jobLines.map(line => 
        line.id === updatedJobLine.id ? updatedJobLine : line
      );
      onJobLinesChange(updatedJobLines);
    }
  };

  const handleJobLinesReorder = (reorderedJobLines: WorkOrderJobLine[]) => {
    onJobLinesChange(reorderedJobLines);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Job Lines (Labor)</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Job Line
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <UnifiedItemsTable
          jobLines={jobLines}
          allParts={[]}
          onJobLineUpdate={handleJobLineUpdate}
          onJobLineDelete={handleJobLineDelete}
          onReorderJobLines={handleJobLinesReorder}
          isEditMode={isEditMode}
          showType="labor"
        />
      </CardContent>
    </Card>
  );
}
