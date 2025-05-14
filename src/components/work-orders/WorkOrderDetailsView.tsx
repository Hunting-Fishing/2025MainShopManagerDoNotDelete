
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderPageLayout } from "./WorkOrderPageLayout";
import { WorkOrderDetailsHeader } from "./details/WorkOrderDetailsHeader";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";

export interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  if (!workOrder) {
    return null;
  }

  return (
    <WorkOrderPageLayout
      title={`Work Order: ${workOrder.id}`}
      description={workOrder.description || "No description provided"}
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
    >
      <div className="space-y-6">
        <WorkOrderDetailsHeader workOrder={workOrder} />
        <WorkOrderDetailsTabs workOrder={workOrder} />
      </div>
    </WorkOrderPageLayout>
  );
}
