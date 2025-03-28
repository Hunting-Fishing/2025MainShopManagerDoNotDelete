
import { useState } from "react";
import { WorkOrder } from "@/types/invoice";

export function useInvoiceWorkOrder(initialWorkOrderId: string = "") {
  const [workOrderId, setWorkOrderId] = useState<string>(initialWorkOrderId);
  const [customer, setCustomer] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Handle selecting a work order
  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    setWorkOrderId(workOrder.id);
    setCustomer(workOrder.customer);
    setDescription(workOrder.description);
    
    return {
      workOrderId: workOrder.id,
      customer: workOrder.customer,
      description: workOrder.description,
      assignedStaff: [workOrder.technician].filter(t => t !== "Unassigned")
    };
  };

  return {
    workOrderId,
    customer,
    description,
    setWorkOrderId,
    setCustomer,
    setDescription,
    handleSelectWorkOrder
  };
}
