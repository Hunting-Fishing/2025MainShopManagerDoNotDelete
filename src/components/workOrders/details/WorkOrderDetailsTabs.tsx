
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
import { NotesSection } from "@/components/work-orders/NotesSection";
import { WorkOrderStatusTimeline } from "@/components/work-orders/details/WorkOrderStatusTimeline";
import { TimeTrackingSection } from "@/components/work-orders/time-tracking/TimeTrackingSection";
import { WorkOrderActivitiesSection } from "@/components/work-orders/WorkOrderActivitiesSection";
import { StatusUpdateButton } from '@/components/work-orders/StatusUpdateButton';
import { Button } from '@/components/ui/button';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  userId?: string; 
  userName?: string;
  onStatusUpdate?: (updatedWorkOrder: WorkOrder) => void;
}

export function WorkOrderDetailsTabs({ 
  workOrder, 
  onUpdateTimeEntries,
  userId = "current-user",
  userName = "Current User",
  onStatusUpdate = () => {}
}: WorkOrderDetailsTabsProps) {
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
      </TabsList>
      
      <TabsContent value="details" className="space-y-4 mt-4">
        <div className="mb-4 p-4 bg-slate-50 rounded-lg border">
          <h3 className="font-medium mb-2">Status Actions</h3>
          <div className="flex flex-wrap gap-2">
            {workOrder.status !== "in-progress" && (
              <StatusUpdateButton
                workOrder={workOrder}
                newStatus="in-progress"
                userId={userId}
                userName={userName}
                onStatusUpdate={onStatusUpdate}
              />
            )}
            
            {workOrder.status !== "completed" && (
              <StatusUpdateButton
                workOrder={workOrder}
                newStatus="completed"
                userId={userId}
                userName={userName}
                onStatusUpdate={onStatusUpdate}
              />
            )}
            
            {workOrder.status !== "cancelled" && (
              <StatusUpdateButton
                workOrder={workOrder}
                newStatus="cancelled"
                userId={userId}
                userName={userName}
                onStatusUpdate={onStatusUpdate}
              />
            )}
          </div>
        </div>
        
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
        {workOrder.inventoryItems && workOrder.inventoryItems.length > 0 ? (
          <WorkOrderInventoryTable
            items={workOrder.inventoryItems}
            onRemoveItem={(id) => console.log("Remove item", id)}
            onUpdateQuantity={(id, quantity) => console.log("Update quantity", id, quantity)}
          />
        ) : (
          <div className="p-8 text-center bg-white border rounded-lg">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No Parts or Inventory</h3>
            <p className="text-slate-500 mb-4">
              No parts or inventory items have been added to this work order yet.
            </p>
            <Button>Add Items to Work Order</Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="notes" className="space-y-4 mt-4">
        <NotesSection workOrder={workOrder} onNotesUpdate={onStatusUpdate} />
      </TabsContent>
      
      <TabsContent value="activity" className="space-y-4 mt-4">
        <WorkOrderActivitiesSection workOrderId={workOrder.id} />
      </TabsContent>
    </Tabs>
  );
}
