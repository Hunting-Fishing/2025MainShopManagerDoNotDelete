
import React from 'react';
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderPartsEstimate } from "./WorkOrderPartsEstimate";

interface WorkOrderInventoryItemsProps {
  workOrder: WorkOrder;
}

export function WorkOrderInventoryItems({ workOrder }: WorkOrderInventoryItemsProps) {
  if (!workOrder.inventoryItems || workOrder.inventoryItems.length === 0) {
    return null;
  }
  
  return <WorkOrderPartsEstimate items={workOrder.inventoryItems} />;
}
