
import React, { useState } from "react";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { WorkOrderPageLayout } from "./WorkOrderPageLayout";
import { WorkOrderDetailsHeader } from "./details/WorkOrderDetailsHeader";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";

export interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder?.timeEntries || []);

  if (!workOrder) {
    return null;
  }
  
  // Handler for updating time entries
  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setTimeEntries(entries);
  };

  return (
    <WorkOrderPageLayout
      title={`Work Order: ${workOrder.id}`}
      description={workOrder.description || "No description provided"}
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
    >
      <div className="space-y-6">
        <WorkOrderDetailsHeader workOrder={workOrder} />
        <WorkOrderDetailsTabs 
          workOrder={workOrder} 
          onUpdateTimeEntries={handleUpdateTimeEntries} 
        />
      </div>
    </WorkOrderPageLayout>
  );
}
