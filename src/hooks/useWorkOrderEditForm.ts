import { useState, useEffect, useCallback } from "react";
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { toast } from "sonner";
import { getWorkOrderById, updateWorkOrder } from "@/services/workOrder";
import { useNavigate } from "react-router-dom";

export const useWorkOrderEditForm = (workOrderId: string) => {
  const [workOrder, setWorkOrder] = useState<Partial<WorkOrder>>({});
  const [originalWorkOrder, setOriginalWorkOrder] = useState<Partial<WorkOrder>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Fetch work order data
  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        const data = await getWorkOrderById(workOrderId);
        setWorkOrder(data);
        setOriginalWorkOrder(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching work order:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch work order";
        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
      }
    };
    
    fetchWorkOrder();
  }, [workOrderId]);
  
  // Function to update a single field
  const updateField = useCallback((field: keyof WorkOrder, value: any) => {
    setWorkOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);
  
  // Function to handle form submission
  const handleSubmit = useCallback(async (status?: WorkOrderStatusType) => {
    setSaving(true);
    setError(null);
    
    try {
      // If status is provided in the call, use it
      const workOrderToSave = {
        ...workOrder,
        status: status || workOrder.status,
      };
      
      // Handle vehicle_year field if it exists
      if ('vehicle_year' in workOrderToSave) {
        // Keep it as is, type system will handle it
      }
      
      // Fixed: Pass the updated work order object with the id included
      const result = await updateWorkOrder({ ...workOrderToSave, id: workOrderId });
      toast.success("Work order updated successfully");
      return result;
    } catch (err) {
      console.error("Error updating work order:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update work order";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setSaving(false);
    }
  }, [workOrder, workOrderId]);
  
  return {
    workOrder,
    updateField,
    handleSubmit,
    loading,
    saving,
    error,
  };
};
