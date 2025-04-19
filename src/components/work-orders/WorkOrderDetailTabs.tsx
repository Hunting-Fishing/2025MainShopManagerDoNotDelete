
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderDetails } from "./details/WorkOrderDetails";
import { WorkOrderPartsEstimate } from "./details/WorkOrderPartsEstimate";
import { WorkOrderTimeTracking } from "./details/WorkOrderTimeTracking";
import { WorkOrderHistory } from "./history/WorkOrderHistory";
import { WorkOrderActions } from "./actions/WorkOrderActions";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { CreateInvoiceButton } from "./actions/CreateInvoiceButton";
import { WorkOrderInvoiceStatus } from "./details/WorkOrderInvoiceStatus";

interface WorkOrderDetailTabsProps {
  workOrder: WorkOrder;
  onTimeEntriesUpdate: (entries: any[]) => void;
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
}

export function WorkOrderDetailTabs({ workOrder, onTimeEntriesUpdate, userId, userName, onStatusUpdate }) {
  const [currentStatus, setCurrentStatus] = useState(workOrder.status);
  const [loading, setLoading] = useState(false);

  // Handler to update the status of the work order
  const handleStatusChange = async (newStatus: WorkOrder["status"]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrder.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setCurrentStatus(newStatus);
      
      // Optimistically update the work order in the UI
      const updatedWorkOrder = { ...workOrder, status: newStatus };
      onStatusUpdate(updatedWorkOrder);

      // Record activity
      await supabase.from('work_order_activities').insert([
        {
          work_order_id: workOrder.id,
          action: 'status_updated',
          user_id: userId,
          user_name: userName,
          details: {
            oldStatus: workOrder.status,
            newStatus: newStatus,
          },
        },
      ]);

      toast({
        title: "Status Updated",
        description: `Work order status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating work order status:", error);
      toast({
        title: "Error",
        description: "Failed to update work order status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
