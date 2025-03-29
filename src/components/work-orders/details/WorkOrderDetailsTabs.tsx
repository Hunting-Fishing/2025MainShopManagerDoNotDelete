
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Clock } from "lucide-react";
import { WorkOrder } from "@/data/workOrdersData";
import { TimeEntry } from "@/types/workOrder";
import { TimeTrackingSection } from "../time-tracking/TimeTrackingSection";
import { WorkOrderInformation } from "./WorkOrderInformation";
import { WorkOrderInventoryItems } from "./WorkOrderInventoryItems";

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries: (timeEntries: TimeEntry[]) => void;
}

export function WorkOrderDetailsTabs({ workOrder, onUpdateTimeEntries }: WorkOrderDetailsTabsProps) {
  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">
          <ClipboardList className="mr-2 h-4 w-4" />
          Details
        </TabsTrigger>
        <TabsTrigger value="time-tracking">
          <Clock className="mr-2 h-4 w-4" />
          Time Tracking
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-6">
        <WorkOrderInformation workOrder={workOrder} />
        <WorkOrderInventoryItems inventoryItems={workOrder.inventoryItems} />
      </TabsContent>
      
      <TabsContent value="time-tracking">
        <TimeTrackingSection 
          workOrderId={workOrder.id}
          timeEntries={workOrder.timeEntries || []}
          onUpdateTimeEntries={onUpdateTimeEntries}
        />
      </TabsContent>
    </Tabs>
  );
}
