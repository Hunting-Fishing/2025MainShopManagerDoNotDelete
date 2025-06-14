import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { WorkOrderOverviewHeader } from './WorkOrderOverviewHeader';
import { WorkOrderDetailsTab } from './WorkOrderDetailsTab';

interface WorkOrderComprehensiveOverviewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onTimeEntriesChange: (timeEntries: TimeEntry[]) => void;
  isEditMode: boolean;
}

export function WorkOrderComprehensiveOverview({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  onJobLinesChange,
  onTimeEntriesChange,
  isEditMode
}: WorkOrderComprehensiveOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Only the OverviewHeader here */}
      <WorkOrderOverviewHeader
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
      />

      {/* Content tab */}
      <WorkOrderDetailsTab
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
        onJobLinesChange={onJobLinesChange}
        isEditMode={isEditMode}
      />
    </div>
  );
}
