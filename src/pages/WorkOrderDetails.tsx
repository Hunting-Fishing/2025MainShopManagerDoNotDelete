
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkOrder } from "@/types/workOrder";
import { findWorkOrderById, updateWorkOrder } from "@/utils/workOrders";
import { TimeEntry } from "@/types/workOrder";
import { toast } from "@/hooks/use-toast";
import { WorkOrderDetailsTabs } from "@/components/workOrders/WorkOrderDetailsTabs";
import { WorkOrderHeader } from "@/components/workOrders/header/WorkOrderHeader";
import WorkOrderEditForm from "@/components/workOrders/WorkOrderEditForm";

interface WorkOrderDetailsProps {
  edit?: boolean;
}

export default function WorkOrderDetails({ edit = false }: WorkOrderDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const currentUser = { id: "user-123", name: "Admin User" };

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

  const handleStatusUpdate = (updatedWorkOrder: WorkOrder) => {
    setWorkOrder(updatedWorkOrder);
  };

  useEffect(() => {
    const fetchWorkOrder = async () => {
      setLoading(true);
      try {
        if (!id) {
          navigate("/work-orders");
          return;
        }

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
    return null;
  }

  return (
    <div className="space-y-6">
      <WorkOrderHeader 
        workOrder={workOrder}
        onBack={() => navigate("/work-orders")}
        onEdit={!edit ? () => navigate(`/work-orders/${id}/edit`) : undefined}
      />
      
      <div>
        {edit ? (
          <WorkOrderEditForm workOrder={workOrder} />
        ) : (
          <WorkOrderDetailsTabs
            workOrder={workOrder}
            onUpdateTimeEntries={handleUpdateTimeEntries}
            userId={currentUser.id}
            userName={currentUser.name}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
}
