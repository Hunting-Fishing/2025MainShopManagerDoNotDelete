
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderDetails } from "./details/WorkOrderDetails";
import { WorkOrderPartsEstimate } from "./details/WorkOrderPartsEstimate";
import { WorkOrderTimeTracking } from "./details/WorkOrderTimeTracking";
import { WorkOrderHistory } from "./history/WorkOrderHistory";
import { WorkOrderActions } from "./actions/WorkOrderActions";
import { CreateInvoiceButton } from "./actions/CreateInvoiceButton";
import { WorkOrderInvoiceStatus } from "./details/WorkOrderInvoiceStatus";
import { useWorkOrderStatusManager } from "@/hooks/workOrders/useWorkOrderStatusManager";
import { toast } from "@/hooks/use-toast";

interface WorkOrderDetailTabsProps {
  workOrder: WorkOrder;
  onTimeEntriesUpdate: (entries: any[]) => void;
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
}

export function WorkOrderDetailTabs({ workOrder, onTimeEntriesUpdate, userId, userName, onStatusUpdate }) {
  const { updateStatus, isUpdating } = useWorkOrderStatusManager();

  // Handler to update the status of the work order
  const handleStatusChange = async (newStatus: WorkOrder["status"]) => {
    const updatedWorkOrder = await updateStatus(workOrder, newStatus, userId, userName);
    if (updatedWorkOrder) {
      onStatusUpdate(updatedWorkOrder);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <WorkOrderActions
          currentStatus={workOrder.status}
          onStatusChange={handleStatusChange}
        />
        <CreateInvoiceButton workOrder={workOrder} />
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-6">
          <WorkOrderDetails workOrder={workOrder} />
          <WorkOrderInvoiceStatus workOrder={workOrder} />
          {workOrder.inventoryItems && workOrder.inventoryItems.length > 0 && (
            <WorkOrderPartsEstimate items={workOrder.inventoryItems} />
          )}
        </TabsContent>

        <TabsContent value="time-tracking" className="space-y-6 mt-6">
          <WorkOrderTimeTracking
            workOrder={workOrder}
            onTimeEntriesUpdate={onTimeEntriesUpdate}
            userId={userId}
            userName={userName}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <WorkOrderHistory workOrderId={workOrder.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
