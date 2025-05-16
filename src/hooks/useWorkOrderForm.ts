
import { useState, useCallback } from "react";
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { toast } from "sonner";
import { createWorkOrder, updateWorkOrder } from "@/services/workOrderService";
import { useNavigate } from "react-router-dom";

export const useWorkOrderForm = (initialWorkOrder?: Partial<WorkOrder>) => {
  const [workOrder, setWorkOrder] = useState<Partial<WorkOrder>>(
    initialWorkOrder || {
      status: "pending" as WorkOrderStatusType,
      description: "",
      service_type: "",
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateField = useCallback((field: keyof WorkOrder, value: any) => {
    setWorkOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null); // Clear any errors when fields are updated
  }, []);

  const handleSubmit = useCallback(
    async (status?: WorkOrderStatusType) => {
      setLoading(true);
      setError(null);
      
      try {
        // If status is provided in the call, use it
        const workOrderToSave = {
          ...workOrder,
          status: status || workOrder.status,
        };
        
        // Convert estimated_hours from string to number if needed
        if (typeof workOrderToSave.estimated_hours === "string") {
          workOrderToSave.estimated_hours = parseFloat(workOrderToSave.estimated_hours);
        }
        
        // Handle vehicle_year field
        if (workOrderToSave.vehicle_year !== undefined) {
          // No conversion needed here, just use the field as is
          // Type system will understand this is a string | number
        }

        const result = workOrder.id
          ? await updateWorkOrder(workOrder.id, workOrderToSave)
          : await createWorkOrder(workOrderToSave);

        toast.success(
          workOrder.id
            ? "Work order updated successfully"
            : "Work order created successfully"
        );
        
        navigate(`/work-orders/${result.id}`);
        return result;
      } catch (err) {
        console.error("Error saving work order:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unknown error occurred while saving work order";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [workOrder, navigate]
  );

  return {
    workOrder,
    setWorkOrder,
    updateField,
    handleSubmit,
    loading,
    error,
  };
};
