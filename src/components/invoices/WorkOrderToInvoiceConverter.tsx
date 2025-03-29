
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { WorkOrder } from "@/types/invoice";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useWorkOrderTimeEntries } from "@/hooks/invoice/useWorkOrderTimeEntries";
import { useNotifications } from "@/context/notifications";

interface WorkOrderToInvoiceConverterProps {
  workOrder: WorkOrder;
}

export const WorkOrderToInvoiceConverter: React.FC<WorkOrderToInvoiceConverterProps> = ({ 
  workOrder
}) => {
  const navigate = useNavigate();
  const { addTimeEntriesToInvoiceItems } = useWorkOrderTimeEntries();
  const { addNotification } = useNotifications();

  const handleCreateInvoice = () => {
    // Check if this work order has billable time
    if (workOrder.timeEntries && workOrder.totalBillableTime && workOrder.totalBillableTime > 0) {
      // Navigate to create invoice with this work order ID
      navigate(`/invoices/new/${workOrder.id}`);
    } else {
      // Navigate to the regular invoice creation page
      navigate(`/invoices/new?workOrderId=${workOrder.id}`);
    }

    toast({
      title: "Create Invoice",
      description: "Creating a new invoice from this work order",
    });

    // Also add a notification
    addNotification({
      title: "Invoice Creation Started",
      message: `Creating a new invoice from work order ${workOrder.id}`,
      type: "info",
    });
  };

  return (
    <div className="mt-4">
      <Button 
        onClick={handleCreateInvoice}
        className="flex items-center gap-2"
      >
        <FileText size={16} />
        Create Invoice
      </Button>
    </div>
  );
};
