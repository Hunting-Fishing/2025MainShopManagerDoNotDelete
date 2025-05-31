
import React from "react";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import WorkOrdersHeader from "@/components/work-orders/WorkOrdersHeader";
import WorkOrdersTable from "@/components/work-orders/WorkOrdersTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function WorkOrders() {
  const { workOrders, loading, error } = useWorkOrders();

  console.log('WorkOrders render - loading:', loading, 'workOrders:', workOrders, 'error:', error);

  if (loading) {
    return (
      <div className="space-y-6">
        <WorkOrdersHeader workOrders={[]} />
        <div className="flex items-center justify-center h-40">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading work orders...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <WorkOrdersHeader workOrders={[]} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading work orders: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkOrdersHeader workOrders={workOrders} />
      <WorkOrdersTable workOrders={workOrders} />
    </div>
  );
}
