
import { useState } from "react";
import { WorkOrderFormValues, WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";

// Export the type so other components can use it
export type { WorkOrderFormValues };

// Default values for a new work order
const defaultValues: WorkOrderFormValues = {
  estimated_hours: 0,
  status: "pending" as WorkOrderStatusType,
  description: "",
  service_type: "",
  customer: "",
  location: "",
  notes: "",
  priority: "medium",
  dueDate: "",
  technician: "",
  technician_id: "",
  inventoryItems: []
};

export function useWorkOrderForm(initialData: Partial<WorkOrder> = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<WorkOrderFormValues>({
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  });

  // For backward compatibility
  const workOrder = form.watch();
  const loading = isSubmitting;

  const updateField = (field: keyof WorkOrderFormValues, value: any) => {
    form.setValue(field, value);
  };

  const handleSubmit = async (values?: WorkOrderFormValues): Promise<WorkOrderFormValues> => {
    const data = values || form.getValues();
    setIsSubmitting(true);

    try {
      // In a real implementation, this would save to the database
      console.log("Submitting work order:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return data;
    } catch (error) {
      console.error("Error submitting work order:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit,
    // For backwards compatibility
    workOrder,
    updateField,
    loading
  };
}
