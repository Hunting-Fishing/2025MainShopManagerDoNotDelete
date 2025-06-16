
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLinesTable } from '../job-lines/JobLinesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

interface JobLinesSectionProps {
  workOrderId: string;
  description?: string; // Add the description prop that's being passed
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
  shopId?: string; // Add shopId prop that's being passed
}

export function JobLinesSection({
  workOrderId,
  description, // Accept the description prop
  jobLines,
  onJobLinesChange,
  isEditMode,
  shopId // Accept the shopId prop
}: JobLinesSectionProps) {
  const [allParts, setAllParts] = React.useState<WorkOrderPart[]>([]);

  React.useEffect(() => {
    const fetchParts = async () => {
      if (workOrderId) {
        try {
          const parts = await getWorkOrderParts(workOrderId);
          setAllParts(parts);
        } catch (error) {
          console.error('Error fetching work order parts:', error);
          setAllParts([]);
        }
      }
    };

    fetchParts();
  }, [workOrderId]);

  const handleJobLineUpdate = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(line => 
      line.id === updatedJobLine.id ? updatedJobLine : line
    );
    onJobLinesChange(updatedJobLines);
  };

  const handleJobLineDelete = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    const updatedParts = allParts.map(part => 
      part.id === updatedPart.id ? updatedPart : part
    );
    setAllParts(updatedParts);
  };

  const handlePartDelete = (partId: string) => {
    const updatedParts = allParts.filter(part => part.id !== partId);
    setAllParts(updatedParts);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Lines Management</CardTitle>
      </CardHeader>
      <CardContent>
        <JobLinesTable
          jobLines={jobLines}
          allParts={allParts}
          onUpdate={handleJobLineUpdate}
          onDelete={handleJobLineDelete}
          onPartUpdate={handlePartUpdate}
          onPartDelete={handlePartDelete}
        />
      </CardContent>
    </Card>
  );
}
