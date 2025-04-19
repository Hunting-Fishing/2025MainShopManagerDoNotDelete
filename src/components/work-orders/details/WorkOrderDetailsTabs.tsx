
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
import { WorkOrder } from "@/types/workOrder";
import { TimeEntry } from "@/types/workOrder";
import { WorkOrderInventoryTable } from "@/components/work-orders/inventory/WorkOrderInventoryTable";
import { WorkOrderNotes } from "@/components/work-orders/details/WorkOrderNotes";
import { WorkOrderStatusTimeline } from "@/components/work-orders/details/WorkOrderStatusTimeline";
import { TimeTrackingSection } from "@/components/work-orders/time-tracking/TimeTrackingSection";
import { WorkOrderActivityHistory } from "@/components/work-orders/details/WorkOrderActivityHistory";
import { CallLogger } from '@/components/calls/CallLogger';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export function WorkOrderDetailsTabs({ workOrder, onUpdateTimeEntries }: WorkOrderDetailsTabsProps) {
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
      
      <TabsContent value="time" className="space-y-4 mt-4">
        <TimeTrackingSection 
          workOrderId={workOrder.id} 
          timeEntries={workOrder.timeEntries || []}
          onUpdateTimeEntries={onUpdateTimeEntries}
        />
      </TabsContent>
      
      <TabsContent value="inventory" className="space-y-4 mt-4">
        <WorkOrderInventoryTable
          items={workOrder.inventoryItems || []}
          onRemoveItem={(id) => console.log("Remove item", id)}
          onUpdateQuantity={(id, quantity) => console.log("Update item quantity", id, quantity)}
        />
      </TabsContent>
      
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
