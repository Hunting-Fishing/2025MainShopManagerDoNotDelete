
import React, { useState, useEffect } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

interface JobLinesSectionProps {
  workOrderId: string;
  description?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
  shopId?: string;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  isEditMode,
  shopId
}: JobLinesSectionProps) {
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);

  useEffect(() => {
    const fetchParts = async () => {
      if (workOrderId && workOrderId !== `temp-${Date.now()}`) {
        try {
          setPartsLoading(true);
          const parts = await getWorkOrderParts(workOrderId);
          setAllParts(parts);
        } catch (error) {
          console.error('Error fetching work order parts:', error);
          setAllParts([]);
        } finally {
          setPartsLoading(false);
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Job Lines & Parts</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Job Line
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {partsLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Loading job lines and parts...
          </div>
        ) : (
          <CompactJobLinesTable
            jobLines={jobLines}
            allParts={allParts}
            onUpdate={isEditMode ? handleJobLineUpdate : undefined}
            onDelete={isEditMode ? handleJobLineDelete : undefined}
            onPartUpdate={isEditMode ? handlePartUpdate : undefined}
            onPartDelete={isEditMode ? handlePartDelete : undefined}
            isEditMode={isEditMode}
          />
        )}
      </CardContent>
    </Card>
  );
}
