
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/data/workOrdersData";
import { deleteWorkOrder } from "@/utils/workOrderUtils";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash, ArrowLeft } from "lucide-react";
import { WorkOrderDetailsHeader } from "@/components/work-orders/details/WorkOrderDetailsHeader";
import { WorkOrderDetailsTabs } from "@/components/work-orders/details/WorkOrderDetailsTabs";
import { WorkOrderChatButton } from "@/components/work-orders/WorkOrderChatButton";
import { TimeEntry } from "@/types/workOrder";

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export default function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleDelete = async () => {
    try {
      await deleteWorkOrder(workOrder.id);
      
      toast({
        title: "Work Order Deleted",
        description: `Work order ${workOrder.id} has been deleted.`,
        variant: "success",
      });
      
      navigate("/work-orders");
    } catch (error) {
      console.error("Error deleting work order:", error);
      toast({
        title: "Error",
        description: "Failed to delete work order.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTimeEntries = async (updatedEntries: TimeEntry[]) => {
    // Implementation to update time entries
    console.log("Updated time entries:", updatedEntries);
  };

  return (
    <div className="space-y-6">
      {/* Header with basic info and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/work-orders")}
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Work Orders
        </Button>
        
        <div className="flex space-x-2">
          <WorkOrderChatButton workOrderId={workOrder.id} />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Work Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this work order? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Work Order Details Header */}
      <WorkOrderDetailsHeader workOrder={workOrder} />
      
      {/* Work Order Content Tabs */}
      <WorkOrderDetailsTabs 
        workOrder={workOrder} 
        onUpdateTimeEntries={handleUpdateTimeEntries} 
      />
    </div>
  );
}
