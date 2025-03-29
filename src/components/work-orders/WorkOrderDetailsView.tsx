
import React, { useState } from "react";
import { WorkOrder } from "@/data/workOrdersData";
import { TimeEntry } from "@/types/workOrder";
import { toast } from "@/components/ui/use-toast";
import { WorkOrderDetailsHeader } from "./details/WorkOrderDetailsHeader";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export default function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder>(workOrder);

  // Handle updating time entries
  const handleUpdateTimeEntries = (timeEntries: TimeEntry[]) => {
    // Calculate total billable time
    const totalBillableTime = timeEntries.reduce((total, entry) => {
      return entry.billable ? total + entry.duration : total;
    }, 0);

    // Update work order with new time entries
    const updatedWorkOrder = {
      ...currentWorkOrder,
      timeEntries,
      totalBillableTime
    };

    setCurrentWorkOrder(updatedWorkOrder);

    // In a real app, you would save this to the backend
    console.log("Updated work order with time entries:", updatedWorkOrder);

    // Show success message
    toast({
      title: "Time Entries Updated",
      description: "Time entries have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <WorkOrderDetailsHeader workOrder={currentWorkOrder} />
      <WorkOrderDetailsTabs 
        workOrder={currentWorkOrder} 
        onUpdateTimeEntries={handleUpdateTimeEntries} 
      />
    </div>
  );
}
