import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useJobLines } from '@/hooks/useJobLines';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

interface WorkOrderDetailsViewProps {
  // No props needed, using router params
}

export function WorkOrderDetailsView({}: WorkOrderDetailsViewProps) {
  const { id: workOrderId } = useParams<{ id: string }>();
  const { workOrder, isLoading: isWorkOrderLoading, error: workOrderError } = useWorkOrder(workOrderId || '');
  const { jobLines, setJobLines, isLoading: isJobLinesLoading, error: jobLinesError } = useJobLines(workOrderId || '');
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [partsLoading, setPartsLoading] = useState(false);

  useEffect(() => {
    const fetchParts = async () => {
      if (workOrderId) {
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

  const handleJobLinesChange = (newJobLines: WorkOrderJobLine[]) => {
    setJobLines(newJobLines);
  };

  const handleTimeEntriesChange = (newTimeEntries: TimeEntry[]) => {
    setTimeEntries(newTimeEntries);
  };

  if (!workOrderId || isWorkOrderLoading || isJobLinesLoading || partsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading Work Order...</h1>
          <p className="text-muted-foreground">Please wait while we fetch the details.</p>
        </div>
      </div>
    );
  }

  if (workOrderError || jobLinesError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">
            {workOrderError?.message || jobLinesError?.message || 'Failed to load work order details.'}
          </p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Work Order Not Found</h1>
          <p className="text-muted-foreground">The requested work order does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Render only once, at the very top */}
      <WorkOrderDetailsHeader workOrder={workOrder} />
      <WorkOrderComprehensiveOverview
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries}
        onJobLinesChange={handleJobLinesChange}
        onTimeEntriesChange={handleTimeEntriesChange}
        isEditMode={isEditMode}
      />
    </div>
  );
}
