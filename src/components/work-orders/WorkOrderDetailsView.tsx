
import React, { useState, useEffect } from "react";
import { WorkOrder } from "@/data/workOrdersData";
import { TimeEntry } from "@/types/workOrder";
import { toast } from "@/hooks/use-toast";
import WorkOrderDetailsHeader from "./details/WorkOrderDetailsHeader";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";
import { updateWorkOrder, recordWorkOrderActivity } from "@/utils/workOrderUtils";

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
  const handleUpdateTimeEntries = async (timeEntries: TimeEntry[]) => {
    try {
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

      // Save to Supabase
      const savedWorkOrder = await updateWorkOrder(updatedWorkOrder);
      
      setCurrentWorkOrder(savedWorkOrder);

      // Show success message
      toast({
        title: "Time Entries Updated",
        description: "Time entries have been updated successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating time entries:", error);
      toast({
        title: "Error",
        description: "Failed to update time entries.",
        variant: "destructive",
      });
    }
  };

  // Delete work order function - will be implemented later
  const handleDeleteWorkOrder = () => {
    toast({
      title: "Delete not implemented",
      description: "This is a mock function. Deletion is not implemented.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <WorkOrderDetailsHeader workOrder={currentWorkOrder} onDelete={handleDeleteWorkOrder} />
      <WorkOrderDetailsTabs 
        workOrder={currentWorkOrder} 
        onUpdateTimeEntries={handleUpdateTimeEntries} 
      />
    </div>
  );
}
