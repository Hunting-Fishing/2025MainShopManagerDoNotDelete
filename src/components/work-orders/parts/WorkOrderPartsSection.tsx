
import React, { useState, useEffect } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  isEditMode
}: WorkOrderPartsSectionProps) {
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!workOrderId) return;
      
      try {
        setIsLoading(true);
        const [parts, lines] = await Promise.all([
          getWorkOrderParts(workOrderId),
          getWorkOrderJobLines(workOrderId)
        ]);
        setAllParts(parts);
        setJobLines(lines);
      } catch (error) {
        console.error('Error fetching parts and job lines:', error);
        setAllParts([]);
        setJobLines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workOrderId]);

  const handleJobLineUpdate = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(line => 
      line.id === updatedJobLine.id ? updatedJobLine : line
    );
    setJobLines(updatedJobLines);
  };

  const handleJobLineDelete = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
    setJobLines(updatedJobLines);
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
          <CardTitle className="text-base">Parts & Inventory</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Loading parts and job lines...
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
