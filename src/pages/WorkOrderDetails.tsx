
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkOrder } from "@/types/workOrder";
import { findWorkOrderById, updateWorkOrder } from "@/utils/workOrders";
import WorkOrderDetailsView from "@/components/work-orders/WorkOrderDetailsView";
import WorkOrderEditForm from "@/components/work-orders/WorkOrderEditForm";
import { toast } from "@/hooks/use-toast";
import { TimeEntry } from "@/types/workOrder";

interface WorkOrderDetailsProps {
  edit?: boolean;
}

export default function WorkOrderDetails({ edit = false }: WorkOrderDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Update time entries in the state
  const handleUpdateTimeEntries = async (updatedEntries: TimeEntry[]) => {
    if (!workOrder) return;
    
    const updatedWorkOrder = {
      ...workOrder,
      timeEntries: updatedEntries,
      totalBillableTime: updatedEntries.reduce((total, entry) => {
        return entry.billable ? total + entry.duration : total;
      }, 0)
    };
    
    setWorkOrder(updatedWorkOrder);
    
    try {
      // Save the updated work order to persist the time entries
      await updateWorkOrder(updatedWorkOrder);
    } catch (error) {
      console.error("Error updating time entries:", error);
      toast({
        title: "Error",
        description: "Failed to save time entries.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchWorkOrder = async () => {
      setLoading(true);
      try {
        if (!id) {
          navigate("/work-orders");
          return;
        }

        // We're now using async findWorkOrderById that connects to Supabase
        const foundWorkOrder = await findWorkOrderById(id);
        
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
        <WorkOrderDetailsView 
          workOrder={workOrder} 
        />
      )}
    </div>
  );
}
