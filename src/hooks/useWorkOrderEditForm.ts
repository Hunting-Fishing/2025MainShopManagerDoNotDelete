
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { WorkOrder } from "@/data/workOrdersData";
import { updateWorkOrder } from "@/utils/workOrderUtils";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

export const useWorkOrderEditForm = (workOrder: WorkOrder) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse the date strings into Date objects
  const dueDateAsDate = parse(workOrder.dueDate, "yyyy-MM-dd", new Date());

  // Make sure workOrder.inventoryItems is properly typed or provide a default empty array
  const inventoryItemsWithDefaults: WorkOrderInventoryItem[] = workOrder.inventoryItems || [];

  // Initialize the form with existing work order data
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: workOrder.customer,
      description: workOrder.description,
      status: workOrder.status as "pending" | "in-progress" | "completed" | "cancelled",
      priority: workOrder.priority as "low" | "medium" | "high",
      technician: workOrder.technician,
      location: workOrder.location,
      dueDate: dueDateAsDate,
      notes: workOrder.notes || "",
      inventoryItems: inventoryItemsWithDefaults,
    },
  });

  // Handle form submission
  const onSubmit = async (values: WorkOrderFormSchemaValues) => {
    setIsSubmitting(true);
    
    try {
      // Format the date back to YYYY-MM-DD string format
      const formattedDueDate = format(values.dueDate, "yyyy-MM-dd");
      
      // Ensure inventoryItems is properly typed
      const inventoryItems: WorkOrderInventoryItem[] = values.inventoryItems?.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })) || [];
      
      // Create the updated work order object
      const updatedWorkOrder: WorkOrder = {
        ...workOrder,
        customer: values.customer,
        description: values.description,
        status: values.status,
        priority: values.priority,
        technician: values.technician,
        location: values.location,
        dueDate: formattedDueDate,
        notes: values.notes,
        inventoryItems: inventoryItems,
      };
      
      // Update the work order
      await updateWorkOrder(updatedWorkOrder);
      
      // Show success message
      toast({
        title: "Work Order Updated",
        description: `Work order ${workOrder.id} has been updated successfully.`,
      });
      
      // Navigate back to the details view
      navigate(`/work-orders/${workOrder.id}`);
    } catch (error) {
      console.error("Error updating work order:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to update work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting
  };
};
