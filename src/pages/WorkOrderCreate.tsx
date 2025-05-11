
import React from "react";
import { useNavigate } from "react-router-dom";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderPageLayout } from "@/components/work-orders/WorkOrderPageLayout";

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const technicians = ["John Doe", "Jane Smith", "Bob Johnson"]; // Example technicians, will be replaced with real data in production
  
  return (
    <WorkOrderPageLayout
      title="Create Work Order"
      description="Create a new work order for your customer"
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow">
        <WorkOrderForm 
          technicians={technicians} 
          isLoadingTechnicians={false}
        />
      </div>
    </WorkOrderPageLayout>
  );
}
