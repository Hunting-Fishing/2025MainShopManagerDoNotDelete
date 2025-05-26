
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WorkOrderPageLayout } from "@/components/work-orders/WorkOrderPageLayout";
import { getWorkOrderById } from "@/services/workOrder";
import { WorkOrderDetailsView } from "@/components/work-orders/WorkOrderDetailsView";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/types/workOrder";

export default function WorkOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkOrder() {
      if (!id) return;
      
      try {
        const order = await getWorkOrderById(id);
        setWorkOrder(order);
      } catch (error) {
        console.error("Error loading work order:", error);
        toast.error("Failed to load work order");
      } finally {
        setLoading(false);
      }
    }
    
    loadWorkOrder();
  }, [id]);

  if (loading) {
    return (
      <WorkOrderPageLayout
        title="Loading Work Order..."
        description="Please wait while the work order details are being loaded."
        backLink="/work-orders"
        backLinkText="Back to Work Orders"
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </WorkOrderPageLayout>
    );
  }

  if (!workOrder) {
    return (
      <WorkOrderPageLayout
        title="Work Order Not Found"
        description="The requested work order could not be found."
        backLink="/work-orders"
        backLinkText="Back to Work Orders"
      >
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <p className="text-muted-foreground">The work order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/work-orders')}>View All Work Orders</Button>
        </div>
      </WorkOrderPageLayout>
    );
  }

  return <WorkOrderDetailsView workOrder={workOrder} />;
}
