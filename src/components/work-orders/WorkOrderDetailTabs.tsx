
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderDetailsPanel } from "./WorkOrderDetailsPanel";
import { InventorySection } from "./sections/InventorySection";
import { TimeTrackingSection } from "./time-tracking/TimeTrackingSection";
import { NotesSection } from "./NotesSection";
import { WorkOrderActivitiesSection } from "./WorkOrderActivitiesSection";

interface WorkOrderDetailTabsProps {
  workOrder: WorkOrder;
  onTimeEntriesUpdate?: (timeEntries: any[]) => void;
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
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="parts">Parts & Inventory</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4">
        <WorkOrderDetailsPanel 
          workOrder={workOrder} 
          userId={userId} 
          userName={userName}
          onStatusUpdate={onStatusUpdate}
        />
      </TabsContent>
      
      <TabsContent value="time" className="space-y-4">
        <TimeTrackingSection 
          workOrderId={workOrder.id} 
          timeEntries={workOrder.timeEntries || []}
          onUpdateTimeEntries={onTimeEntriesUpdate}
        />
      </TabsContent>
      
      <TabsContent value="parts" className="space-y-4">
        <InventorySection workOrderId={workOrder.id} />
      </TabsContent>
      
      <TabsContent value="notes" className="space-y-4">
        <NotesSection notes={workOrder.notes || ""} />
      </TabsContent>
      
      <TabsContent value="activity" className="space-y-4">
        <WorkOrderActivitiesSection workOrderId={workOrder.id} />
      </TabsContent>
    </Tabs>
  );
}
