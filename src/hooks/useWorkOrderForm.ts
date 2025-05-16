import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { WorkOrderFormSchemaValues } from "@/types/workOrderSchema";
import { useToast } from "@/hooks/use-toast";
import { WorkOrderInventoryItem } from "@/components/work-orders/inventory/WorkOrderInventoryItem";

// Export the type for use in other components
export type WorkOrderFormValues = WorkOrderFormSchemaValues;

export const useWorkOrderForm = (initialData: Partial<WorkOrderFormValues> = {}) => {
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set default values with proper type handling
  const defaultValues: Partial<WorkOrderFormSchemaValues> = {
    title: initialData.title || "",
    description: initialData.description || "",
    customer: initialData.customer || "",
    customer_id: initialData.customer_id || "",
    status: initialData.status || "pending",
    priority: initialData.priority || "medium",
    due_date: initialData.due_date || "",
    technician: initialData.technician || "",
    technician_id: initialData.technician_id || "",
    serviceCategory: initialData.serviceCategory || "",
    service_type: initialData.service_type || "",
    estimated_hours: initialData.estimated_hours || 1,
    location: initialData.location || "",
    notes: initialData.notes || "",
    vehicle_id: initialData.vehicle_id || "",
    vehicle: initialData.vehicle || "",
    make: initialData.make || "",
    model: initialData.model || "",
    year: initialData.year || "",
    vin: initialData.vin || ""
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
    reset
  } = useForm<WorkOrderFormValues>({
    defaultValues,
    mode: "onBlur"
  });

  const onSubmit = useCallback(async (data: WorkOrderFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Work order submitted successfully!",
      });
      
      reset(defaultValues);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [toast, reset, defaultValues]);

  // Fix validateWorkOrder function
  const validateWorkOrder = (values: Partial<WorkOrderFormSchemaValues>) => {
    const errors: Record<string, string> = {};
    
    if (!values.title) {
      errors.title = "Work order title is required";
    }
    
    if (!values.description) {
      errors.description = "Description is required";
    }
    
    if (!values.customer) {
      errors.customer = "Customer is required";
    }
    
    if (!values.due_date) {
      errors.due_date = "Due date is required";
    }
    
    return errors;
  };

  const handleAddItem = (item: WorkOrderInventoryItem) => {
    setInventoryItems([...inventoryItems, item]);
  };

  const handleRemoveItem = (itemId: string) => {
    setInventoryItems(inventoryItems.filter((item) => item.id !== itemId));
  };

  const handleUpdateItem = (itemId: string, updatedItem: WorkOrderInventoryItem) => {
    setInventoryItems(
      inventoryItems.map((item) => (item.id === itemId ? updatedItem : item))
    );
  };

  return {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    errors,
    onSubmit,
    isSubmitting,
    validateWorkOrder,
    inventoryItems,
    setInventoryItems,
    handleAddItem,
    handleRemoveItem,
    handleUpdateItem
  };
};

export default useWorkOrderForm;
