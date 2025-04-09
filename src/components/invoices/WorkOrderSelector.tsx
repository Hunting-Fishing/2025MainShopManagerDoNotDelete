
import { WorkOrder } from "@/types/workOrder";
import { useWorkOrderTimeEntries } from "@/hooks/invoice/useWorkOrderTimeEntries";
import { createInvoiceUpdater } from "@/types/invoice";

interface WorkOrderSelectorProps {
  invoice: any;
  setInvoice: (updater: any) => void;
  handleSelectWorkOrder: (workOrder: WorkOrder) => void;
}

export function useWorkOrderSelector({
  invoice,
  setInvoice,
  handleSelectWorkOrder
}: WorkOrderSelectorProps) {
  const { addTimeEntriesToInvoiceItems } = useWorkOrderTimeEntries();

  // Custom handler to select work order and include time entries
  const handleSelectWorkOrderWithTime = (workOrder: WorkOrder) => {
    // First handle basic work order selection
    handleSelectWorkOrder(workOrder);
    
    // Add billed time to invoice items if present
    if (workOrder.timeEntries && workOrder.timeEntries.length > 0) {
      // Create new items with time entries added
      const updatedItems = addTimeEntriesToInvoiceItems(workOrder, invoice.items);
      
      // Only update if new items were added
      if (updatedItems.length > invoice.items.length) {
        setInvoice(createInvoiceUpdater({
          items: updatedItems
        }));
      }
    }
  };

  return {
    handleSelectWorkOrderWithTime
  };
}
