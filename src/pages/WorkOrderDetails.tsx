
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WorkOrderPageLayout } from "@/components/work-orders/WorkOrderPageLayout";
import { getWorkOrderById } from "@/services/workOrder";
import { WorkOrderDetailsView } from "@/components/work-orders/WorkOrderDetailsView";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/types/workOrder";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function WorkOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkOrder() {
      if (!id) {
        setError("No work order ID provided");
        setLoading(false);
        return;
      }
      
      if (id === "undefined") {
        setError("Invalid work order ID");
        setLoading(false);
        return;
      }
      
      try {
        console.log('Loading work order with ID:', id);
        setLoading(true);
        setError(null);
        
        const order = await getWorkOrderById(id);
        console.log('Loaded work order:', order);
        
        if (!order) {
          setError("Work order not found");
        } else {
          setWorkOrder(order);
        }
      } catch (error) {
        console.error("Error loading work order:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load work order";
        setError(errorMessage);
        toast.error(errorMessage);
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

  if (error) {
    return (
      <WorkOrderPageLayout
        title="Error Loading Work Order"
        description="There was a problem loading the work order details."
        backLink="/work-orders"
        backLinkText="Back to Work Orders"
      >
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <p className="text-muted-foreground">
              The work order you're looking for couldn't be loaded. This might be due to:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>The work order doesn't exist</li>
              <li>You don't have permission to view it</li>
              <li>There's a temporary connection issue</li>
            </ul>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => navigate('/work-orders')}>
                View All Work Orders
              </Button>
            </div>
          </div>
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

  console.log('Rendering WorkOrderDetailsView with:', workOrder);
  return <WorkOrderDetailsView workOrder={workOrder} />;
}
