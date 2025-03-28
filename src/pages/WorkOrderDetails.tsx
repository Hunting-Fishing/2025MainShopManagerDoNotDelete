
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkOrder } from "@/data/workOrdersData";
import { findWorkOrderById } from "@/utils/workOrderUtils";
import WorkOrderDetailsView from "@/components/work-orders/WorkOrderDetailsView";
import WorkOrderEditForm from "@/components/work-orders/WorkOrderEditForm";
import { toast } from "@/hooks/use-toast";

interface WorkOrderDetailsProps {
  edit?: boolean;
}

export default function WorkOrderDetails({ edit = false }: WorkOrderDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWorkOrder = async () => {
      setLoading(true);
      try {
        if (!id) {
          navigate("/work-orders");
          return;
        }

        // We're using a simulated API call with our mock data
        const foundWorkOrder = findWorkOrderById(id);
        
        if (foundWorkOrder) {
          setWorkOrder(foundWorkOrder);
        } else {
          toast({
            title: "Error",
            description: "Work order not found.",
            variant: "destructive",
          });
          navigate("/work-orders");
        }
      } catch (error) {
        console.error("Error fetching work order:", error);
        toast({
          title: "Error",
          description: "Failed to load work order details.",
          variant: "destructive",
        });
        navigate("/work-orders");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg text-slate-500">Loading work order details...</div>
      </div>
    );
  }

  if (!workOrder) {
    return null; // This shouldn't happen as we navigate away if no work order is found
  }

  return (
    <div>
      {edit ? (
        <WorkOrderEditForm workOrder={workOrder} />
      ) : (
        <WorkOrderDetailsView workOrder={workOrder} />
      )}
    </div>
  );
}
