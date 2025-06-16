
import React, { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  isEditMode: boolean;
}

export function TimeTrackingSection({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries,
  isEditMode
}: TimeTrackingSectionProps) {
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!workOrderId) return;
      
      try {
        setIsLoading(true);
        const [lines, parts] = await Promise.all([
          getWorkOrderJobLines(workOrderId),
          getWorkOrderParts(workOrderId)
        ]);
        setJobLines(lines);
        setAllParts(parts);
      } catch (error) {
        console.error('Error fetching job lines and parts:', error);
        setJobLines([]);
        setAllParts([]);
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

  const totalTime = timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);

  return (
    <div className="space-y-6">
      {/* Time Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Tracking Summary
            </CardTitle>
            {isEditMode && (
              <Button size="sm" className="h-8 px-3">
                <Plus className="h-4 w-4 mr-2" />
                Add Time Entry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalTime}h</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{timeEntries.length}</div>
              <div className="text-sm text-muted-foreground">Time Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {timeEntries.filter(entry => entry.billable).length}
              </div>
              <div className="text-sm text-muted-foreground">Billable Entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Lines & Parts Context */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Job Lines & Parts Context</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
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
    </div>
  );
}
