
import React, { useState, useEffect } from "react";
import { WorkOrder } from "@/data/workOrdersData";
import { TimeEntry } from "@/types/workOrder";
import { toast } from "@/hooks/use-toast";
import { WorkOrderDetailsHeader } from "./details/WorkOrderDetailsHeader";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";
import { recordWorkOrderActivity } from "@/utils/activityTracker";

// Mock current user - in a real app, this would come from auth context
const currentUser = { id: "user-123", name: "Admin User" };

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export default function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder>(workOrder);

  // Record view activity when component mounts
  useEffect(() => {
    recordWorkOrderActivity(
      "Viewed", 
      workOrder.id, 
      currentUser.id,
      currentUser.name,
      false // Don't show toast for viewing
    );
  }, [workOrder.id]);

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
      totalBillableTime,
      lastUpdatedBy: currentUser.name,
      lastUpdatedAt: new Date().toISOString()
    };

    setCurrentWorkOrder(updatedWorkOrder);

    // Record time entry update activity
    recordWorkOrderActivity(
      "Updated time entries for", 
      workOrder.id, 
      currentUser.id,
      currentUser.name
    );

    // In a real app, you would save this to the backend
    console.log("Updated work order with time entries:", updatedWorkOrder);

    // Show success message
    toast({
      title: "Time Entries Updated",
      description: "Time entries have been updated successfully.",
      variant: "success",
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
