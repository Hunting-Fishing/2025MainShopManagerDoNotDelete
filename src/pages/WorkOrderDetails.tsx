
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkOrder } from "@/types/workOrder";
import { findWorkOrderById, updateWorkOrder } from "@/utils/workOrders";
import { TimeEntry } from "@/types/workOrder";
import { toast } from "@/hooks/use-toast";
import { WorkOrderDetailTabs } from "@/components/workOrders/WorkOrderDetailTabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Printer } from "lucide-react";
import WorkOrderEditForm from "@/components/workOrders/WorkOrderEditForm";
import { generateWorkOrderPdf } from "@/utils/pdf/workOrderPdf";

interface WorkOrderDetailsProps {
  edit?: boolean;
}

export default function WorkOrderDetails({ edit = false }: WorkOrderDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Mock current user - in a real app, this would come from auth context
  const currentUser = { id: "user-123", name: "Admin User" };

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

  // Handle work order status updates
  const handleStatusUpdate = (updatedWorkOrder: WorkOrder) => {
    setWorkOrder(updatedWorkOrder);
  };

  // Handle print/PDF generation
  const handlePrintWorkOrder = () => {
    if (!workOrder) return;
    
    try {
      const pdf = generateWorkOrderPdf(workOrder);
      pdf.save(`WorkOrder-${workOrder.id}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Work order PDF has been generated successfully."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
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
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/work-orders")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{edit ? "Edit Work Order" : "Work Order Details"}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!edit && (
            <>
              <Button 
                variant="outline" 
                onClick={handlePrintWorkOrder}
                className="flex items-center gap-1"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button 
                onClick={() => navigate(`/work-orders/${id}/edit`)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {edit ? (
          <WorkOrderEditForm workOrder={workOrder} />
        ) : (
          <WorkOrderDetailTabs
            workOrder={workOrder}
            onTimeEntriesUpdate={handleUpdateTimeEntries}
            userId={currentUser.id}
            userName={currentUser.name}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
}
