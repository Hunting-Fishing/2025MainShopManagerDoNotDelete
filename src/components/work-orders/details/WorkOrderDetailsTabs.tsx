
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { WorkOrderNotes } from "./WorkOrderNotes";
import { WorkOrderTimeTracking } from "./WorkOrderTimeTracking";
import { WorkOrderInventoryItems } from "./WorkOrderInventoryItems";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { ExtendedWorkOrderInventoryItem } from "../inventory/WorkOrderInventoryItem";

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries?: (entries: TimeEntry[]) => void;
}

export function WorkOrderDetailsTabs({ 
  workOrder,
  onUpdateTimeEntries 
}: WorkOrderDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("notes");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="inventory">Parts & Inventory</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="notes">
        <Card>
          <CardContent className="pt-6">
            <WorkOrderNotes workOrder={workOrder} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="time">
        <Card>
          <CardContent className="pt-6">
            {onUpdateTimeEntries && (
              <WorkOrderTimeTracking 
                work_order_id={workOrder.id} 
                timeEntries={workOrder.timeEntries || []}
                onUpdateTimeEntries={onUpdateTimeEntries}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="inventory">
        <Card>
          <CardContent className="pt-6">
            <WorkOrderInventoryItems 
              work_order_id={workOrder.id} 
              inventoryItems={workOrder.inventoryItems as ExtendedWorkOrderInventoryItem[] || []}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
