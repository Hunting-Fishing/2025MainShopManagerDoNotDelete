
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeTracking } from "../time-tracking/TimeTracking";
import { WorkOrderNotes } from "./WorkOrderNotes";
import { WorkOrderDocuments } from "./WorkOrderDocuments";
import { WorkOrderHistory } from "./WorkOrderHistory";
import { WorkOrderInventoryItems } from "../inventory/WorkOrderInventoryItems";
import { TimeEntry, WorkOrder, WorkOrderInventoryItem } from "@/types/workOrder";

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  onUpdateNotes?: (notes: string) => void;
}

export const WorkOrderDetailsTabs: React.FC<WorkOrderDetailsTabsProps> = ({
  workOrder,
  onUpdateTimeEntries,
  onUpdateNotes,
}) => {
  const [activeTab, setActiveTab] = useState("details");

  // Extract inventory items from work order
  const inventoryItems = workOrder.inventory_items || workOrder.inventoryItems || [];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleUpdateNotes = (notes: string) => {
    if (onUpdateNotes) {
      onUpdateNotes(notes);
    }
  };

  return (
    <Tabs
      defaultValue="details"
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <div className="space-y-8">
          <WorkOrderNotes
            notes={workOrder.notes || ""}
            onUpdateNotes={handleUpdateNotes}
          />
          <WorkOrderHistory workOrderId={workOrder.id} />
        </div>
      </TabsContent>

      <TabsContent value="time">
        <TimeTracking
          workOrderId={workOrder.id}
          timeEntries={workOrder.time_entries || []}
          onUpdateTimeEntries={onUpdateTimeEntries}
        />
      </TabsContent>

      <TabsContent value="inventory">
        <WorkOrderInventoryItems
          workOrderId={workOrder.id}
          inventoryItems={inventoryItems as WorkOrderInventoryItem[]}
        />
      </TabsContent>

      <TabsContent value="documents">
        <WorkOrderDocuments workOrderId={workOrder.id} />
      </TabsContent>
    </Tabs>
  );
};
