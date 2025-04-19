
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { WorkOrder } from "@/types/workOrder";
import { updateWorkOrder } from "@/utils/workOrders";
import { WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { recordWorkOrderActivity } from "@/utils/workOrders/activity";
import { handleFormError, isNetworkError, handleNetworkError } from "@/utils/errorHandling";

// Mock current user - in a real app, this would come from auth context
const currentUser = { id: "user-123", name: "Admin User" };

export const useWorkOrderEditForm = (workOrder: WorkOrder) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder.timeEntries || []);

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
    setError(null);
    
    try {
      // Check for network connectivity
      if (!navigator.onLine) {
        setError("No internet connection. Please check your network and try again.");
        throw new Error("Network offline");
      }
      
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
      
      // Calculate total billable time
      const totalBillableTime = timeEntries.reduce((total, entry) => {
        return entry.billable ? total + entry.duration : total;
      }, 0);
      
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
        timeEntries: timeEntries,
        totalBillableTime: totalBillableTime,
        lastUpdatedBy: currentUser.name,
        lastUpdatedAt: new Date().toISOString(),
      };
      
      // Update the work order
      await updateWorkOrder(updatedWorkOrder);
      
      // Record the activity
      recordWorkOrderActivity(
        "Updated", 
        workOrder.id, 
        currentUser.id, 
        currentUser.name
      );
      
      // Show success message
      toast({
        title: "Work Order Updated",
        description: `Work order ${workOrder.id} has been updated successfully.`,
        variant: "success",
      });
      
      // Navigate back to the details view
      navigate(`/work-orders/${workOrder.id}`);
    } catch (error) {
      console.error("Error updating work order:", error);
      
      // Handle specific network errors
      if (isNetworkError(error)) {
        handleNetworkError();
        setError("Network connectivity issue. Please check your internet connection.");
      } else {
        // Handle other form errors
        const errorResult = handleFormError(error, "Work Order Update");
        setError(errorResult.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    error,
    timeEntries,
    setTimeEntries
  };
};
