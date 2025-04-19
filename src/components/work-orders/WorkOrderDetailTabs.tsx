
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { WorkOrderDetails } from "./details/WorkOrderDetails";
import { TimeTrackingTab } from "./time-tracking/TimeTrackingTab"; 
import { WorkOrderHistory } from "./history/WorkOrderHistory";
import { WorkOrderActions } from "./actions/WorkOrderActions";
import { updateWorkOrder } from "@/utils/workOrders";
import { toast } from "@/hooks/use-toast";
import { WorkOrderPartsEstimate } from "./details/WorkOrderPartsEstimate";

interface WorkOrderDetailTabsProps {
  workOrder: WorkOrder;
  onTimeEntriesUpdate: (entries: TimeEntry[]) => void;
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
}

export function WorkOrderDetailTabs({
  workOrder,
  onTimeEntriesUpdate,
  userId,
  userName,
  onStatusUpdate
}: WorkOrderDetailTabsProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder.timeEntries || []);

  useEffect(() => {
    if (workOrder.timeEntries) {
      setTimeEntries(workOrder.timeEntries);
    }
  }, [workOrder.timeEntries]);

  const handleTimeEntryAdd = (newEntry: TimeEntry) => {
    const updatedEntries = [...timeEntries, newEntry];
    setTimeEntries(updatedEntries);
    onTimeEntriesUpdate(updatedEntries);
  };

  const handleTimeEntryUpdate = (updatedEntry: TimeEntry) => {
    const updatedEntries = timeEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setTimeEntries(updatedEntries);
    onTimeEntriesUpdate(updatedEntries);
  };

  const handleTimeEntryDelete = (entryId: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
    setTimeEntries(updatedEntries);
    onTimeEntriesUpdate(updatedEntries);
  };

  const handleStatusChange = async (newStatus: "pending" | "in-progress" | "completed" | "cancelled") => {
    try {
      const updatedWorkOrder: WorkOrder = {
        ...workOrder,
        status: newStatus,
        lastUpdatedBy: userName,
        lastUpdatedAt: new Date().toISOString()
      };
      
      // If changing to completed, set the end time
      if (newStatus === "completed" && !updatedWorkOrder.endTime) {
        updatedWorkOrder.endTime = new Date().toISOString();
      }
      
      await updateWorkOrder(updatedWorkOrder);
      
      toast({
        title: "Status Updated",
        description: `Work order status changed to ${newStatus}`,
      });
      
      onStatusUpdate(updatedWorkOrder);
    } catch (error) {
      console.error("Error updating work order status:", error);
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <WorkOrderActions 
        currentStatus={workOrder.status} 
        onStatusChange={handleStatusChange} 
      />
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-6 mt-6">
          <WorkOrderDetails workOrder={workOrder} />
          
          {workOrder.inventoryItems && workOrder.inventoryItems.length > 0 && (
            <WorkOrderPartsEstimate items={workOrder.inventoryItems} />
          )}
        </TabsContent>
        <TabsContent value="time" className="mt-6">
          <TimeTrackingTab
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onAddTimeEntry={handleTimeEntryAdd}
            onUpdateTimeEntry={handleTimeEntryUpdate}
            onDeleteTimeEntry={handleTimeEntryDelete}
            userId={userId}
            userName={userName}
          />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <WorkOrderHistory workOrderId={workOrder.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
