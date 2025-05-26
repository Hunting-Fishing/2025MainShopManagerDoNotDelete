
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { WorkOrderFormValues, WorkOrderInventoryItem } from "@/types/workOrder";
import { useToast } from "@/hooks/use-toast";

// Re-export for other components
export { WorkOrderFormValues } from "@/types/workOrder";

export const useWorkOrderForm = (initialData: Partial<WorkOrderFormValues> = {}) => {
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set default values with proper type handling
  const defaultValues: Partial<WorkOrderFormValues> = {
    description: initialData.description || "",
    customer: initialData.customer || "",
    status: initialData.status || "pending",
    priority: initialData.priority || "medium",
    dueDate: initialData.dueDate || "",
    technician: initialData.technician || "",
    location: initialData.location || "",
    notes: initialData.notes || "",
    vehicleMake: initialData.vehicleMake || "",
    vehicleModel: initialData.vehicleModel || "",
    vehicleYear: initialData.vehicleYear || "",
    licensePlate: initialData.licensePlate || "",
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
  const validateWorkOrder = (values: Partial<WorkOrderFormValues>) => {
    const errors: Record<string, string> = {};
    
    if (!values.description) {
      errors.description = "Description is required";
    }
    
    if (!values.customer) {
      errors.customer = "Customer is required";
    }
    
    if (!values.dueDate) {
      errors.dueDate = "Due date is required";
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
