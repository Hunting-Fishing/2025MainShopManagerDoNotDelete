
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { TimeTracking } from "../time-tracking/TimeTracking";
import { WorkOrderInventoryItems } from "./WorkOrderInventoryItems";
import { WorkOrderDocuments } from './WorkOrderDocuments';
import { WorkOrderHistory } from './WorkOrderHistory';
import { WorkOrderNotes } from './WorkOrderNotes';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  inventoryItems: WorkOrderInventoryItem[];
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

export function WorkOrderDetailsTabs({ 
  workOrder, 
  timeEntries, 
  onUpdateTimeEntries,
  inventoryItems,
  notes,
  onUpdateNotes
}: WorkOrderDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
      <div className="border-b mb-6">
        <TabsList className="bg-transparent">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="details">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Work Order Details</h3>
          <p>ID: {workOrder.id}</p>
          <p>Status: {workOrder.status}</p>
          <p>Description: {workOrder.description || 'No description'}</p>
        </div>
      </TabsContent>

      <TabsContent value="time">
        <TimeTracking
          workOrderId={workOrder.id}
          timeEntries={timeEntries}
          onUpdateTimeEntries={onUpdateTimeEntries}
        />
      </TabsContent>

      <TabsContent value="inventory">
        <WorkOrderInventoryItems 
          workOrderId={workOrder.id}
          inventoryItems={inventoryItems}
        />
      </TabsContent>

      <TabsContent value="documents">
        <WorkOrderDocuments workOrderId={workOrder.id} />
      </TabsContent>

      <TabsContent value="history">
        <WorkOrderHistory workOrderId={workOrder.id} />
      </TabsContent>

      <TabsContent value="notes">
        <WorkOrderNotes 
          workOrderId={workOrder.id}
          notes={notes}
          onUpdateNotes={onUpdateNotes}
        />
      </TabsContent>
    </Tabs>
  );
}
