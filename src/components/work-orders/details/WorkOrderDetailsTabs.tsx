import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { WorkOrderInventoryItems } from "./WorkOrderInventoryItems";
import { TimeTrackingSection } from "../time-tracking/TimeTrackingSection";
import { ExtendedWorkOrderInventoryItem } from "@/types/workOrder";

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export const WorkOrderDetailsTabs: React.FC<WorkOrderDetailsTabsProps> = ({
  workOrder,
  onUpdateTimeEntries
}) => {
  const [activeTab, setActiveTab] = useState("details");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Ensure inventoryItems is defined
  const inventoryItems = workOrder.inventoryItems || [];

  return (
    <Tabs defaultValue="details" value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        {/* Details content */}
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-4">Work Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Customer</p>
              <p className="font-medium">{workOrder.customer}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-medium">{workOrder.status}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Priority</p>
              <p className="font-medium">{workOrder.priority}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Technician</p>
              <p className="font-medium">{workOrder.technician || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Due Date</p>
              <p className="font-medium">{workOrder.due_date}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Created</p>
              <p className="font-medium">{workOrder.created_at}</p>
            </div>
          </div>
          
          {workOrder.description && (
            <div className="mt-4">
              <p className="text-sm text-slate-500">Description</p>
              <p className="mt-1">{workOrder.description}</p>
            </div>
          )}
          
          {workOrder.notes && (
            <div className="mt-4">
              <p className="text-sm text-slate-500">Notes</p>
              <p className="mt-1">{workOrder.notes}</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="time">
        <TimeTrackingSection 
          work_order_id={workOrder.id}
          timeEntries={workOrder.timeEntries || []}
          onUpdateTimeEntries={onUpdateTimeEntries}
        />
      </TabsContent>

      <TabsContent value="inventory">
        <WorkOrderInventoryItems 
          workOrderId={workOrder.id}
          inventoryItems={inventoryItems as ExtendedWorkOrderInventoryItem[]}
        />
      </TabsContent>

      <TabsContent value="documents">
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-4">Documents</h3>
          <p className="text-muted-foreground">Document management features coming soon.</p>
        </div>
      </TabsContent>

      <TabsContent value="communications">
        <div className="p-4 border rounded-md">
          <h3 className="font-medium mb-4">Communications</h3>
          <p className="text-muted-foreground">Communication history will appear here.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
