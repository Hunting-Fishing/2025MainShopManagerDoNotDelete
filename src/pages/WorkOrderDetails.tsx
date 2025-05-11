
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkOrder } from "@/types/workOrder";
import { findWorkOrderById, updateWorkOrder } from "@/utils/workOrders/crud";
import WorkOrderDetailsView from "@/components/work-orders/WorkOrderDetailsView";
import WorkOrderEditForm from "@/components/work-orders/WorkOrderEditForm";
import { toast } from "@/hooks/use-toast";
import { TimeEntry } from "@/types/workOrder";
import { WorkOrderPageLayout } from "@/components/work-orders/WorkOrderPageLayout";
import { Button } from "@/components/ui/button";
import { Edit, Printer } from "lucide-react";

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

        // Now using the imported findWorkOrderById from crud.ts
        const foundWorkOrder = await findWorkOrderById(id, {}); // Adding empty options object as second argument
        
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

  const handleEdit = () => {
    navigate(`/work-orders/${id}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

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

  const actions = !edit ? (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handlePrint} className="rounded-full">
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button onClick={handleEdit} className="rounded-full bg-blue-600 hover:bg-blue-700">
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
    </div>
  ) : null;

  return (
    <WorkOrderPageLayout
      title={edit ? "Edit Work Order" : `Work Order: ${workOrder.id}`}
      description={edit ? "Modify work order details" : workOrder.description}
      actions={actions}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        {edit ? (
          <WorkOrderEditForm workOrder={workOrder} />
        ) : (
          <WorkOrderDetailsView 
            workOrder={workOrder} 
          />
        )}
      </div>
    </WorkOrderPageLayout>
  );
}
