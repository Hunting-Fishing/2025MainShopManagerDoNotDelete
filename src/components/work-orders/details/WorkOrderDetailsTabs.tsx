import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  Clock,
  Package,
  MessageSquare,
  History,
  Phone
} from "lucide-react";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { WorkOrderInventoryItems } from "@/components/work-orders/details/WorkOrderInventoryItems";
import { WorkOrderNotes } from "@/components/work-orders/details/WorkOrderNotes";
import { WorkOrderStatusTimeline } from "@/components/work-orders/details/WorkOrderStatusTimeline";
import { WorkOrderTimeTracking } from "@/components/work-orders/details/WorkOrderTimeTracking";
import { WorkOrderActivityHistory } from "@/components/work-orders/details/WorkOrderActivityHistory";
import { CallLogger } from '@/components/calls/CallLogger';

export interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export function WorkOrderDetailsTabs({ workOrder, onUpdateTimeEntries }: WorkOrderDetailsTabsProps) {
  const activeTab = "time"; // Example active tab
  const timeEntries = []; // Example time entries

  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList className="flex h-auto flex-wrap justify-start bg-transparent p-0 w-full border-b">
        <TabsTrigger
          value="details"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Details
        </TabsTrigger>
        <TabsTrigger
          value="time"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <Clock className="h-4 w-4 mr-2" />
          Time Tracking
        </TabsTrigger>
        <TabsTrigger
          value="inventory"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <Package className="h-4 w-4 mr-2" />
          Parts & Inventory
        </TabsTrigger>
        <TabsTrigger
          value="notes"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Notes
        </TabsTrigger>
        <TabsTrigger
          value="activity"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <History className="h-4 w-4 mr-2" />
          Activity
        </TabsTrigger>
        <TabsTrigger
          value="communications"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <Phone className="h-4 w-4 mr-2" />
          Communications
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4 mt-4">
        <WorkOrderStatusTimeline workOrder={workOrder} />
      </TabsContent>
      
      {activeTab === "time" && (
        <WorkOrderTimeTracking
          workOrderId={workOrder.id} // Changed from workOrder to workOrderId
          timeEntries={timeEntries}
          onUpdateTimeEntries={onUpdateTimeEntries}
        />
      )}
      
      {activeTab === "inventory" && (
        <WorkOrderInventoryItems
          workOrderId={workOrder.id} // Changed from workOrder to workOrderId
          inventoryItems={workOrder.inventory_items as ExtendedWorkOrderInventoryItem[] || []}
        />
      )}
      
      <TabsContent value="notes" className="space-y-4 mt-4">
        <WorkOrderNotes workOrder={workOrder} />
      </TabsContent>
      
      <TabsContent value="activity" className="space-y-4 mt-4">
        <WorkOrderActivityHistory workOrderId={workOrder.id} />
      </TabsContent>
      
      <TabsContent value="communications" className="space-y-4 mt-4">
        <CallLogger workOrder={workOrder} />
      </TabsContent>
    </Tabs>
  );
}
