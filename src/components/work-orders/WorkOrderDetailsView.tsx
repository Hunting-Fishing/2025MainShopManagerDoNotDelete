
import React, { useState } from "react";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { WorkOrderPageLayout } from "./WorkOrderPageLayout";
import { WorkOrderDetailsHeader } from "./details/WorkOrderDetailsHeader";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";

export interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder?.timeEntries || []);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [notes, setNotes] = useState<string>(workOrder?.notes || '');

  if (!workOrder) {
    return null;
  }
  
  // Handler for updating time entries
  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setTimeEntries(entries);
  };
  
  // Handler for updating notes
  const handleUpdateNotes = (updatedNotes: string) => {
    setNotes(updatedNotes);
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
          timeEntries={timeEntries}
          inventoryItems={inventoryItems}
          notes={notes}
          onUpdateNotes={handleUpdateNotes}
          onUpdateTimeEntries={handleUpdateTimeEntries}
        />
      </div>
    </WorkOrderPageLayout>
  );
}
