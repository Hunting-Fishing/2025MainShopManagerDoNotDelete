
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { createWorkOrder } from "@/utils/workOrders";
import { format } from "date-fns";
import { WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { recordWorkOrderActivity } from "@/utils/activity/workOrderActivity";
import { handleFormError, isNetworkError, handleNetworkError } from "@/utils/errorHandling";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

// Export the WorkOrderFormValues type for components
export type WorkOrderFormValues = WorkOrderFormSchemaValues;

// Mock current user - in a real app, this would come from auth context
const currentUser = { id: "user-123", name: "Admin User" };

export const useWorkOrderForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Initialize the form
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      status: "pending",
      priority: "medium",
      technician: "Unassigned",
      notes: "",
      inventoryItems: [],
      serviceCategory: undefined,
      vehicleId: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "", 
      odometer: "",
      licensePlate: "",
    },
  });

  // Function to manually set form values
  const setFormValues = (values: Partial<WorkOrderFormSchemaValues>) => {
    Object.entries(values).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
  };

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
      
      // Format the date to YYYY-MM-DD string
      const formattedDueDate = format(values.dueDate, "yyyy-MM-dd");
      
      // Ensure we have a properly typed array of inventory items
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
      
      // Prepare vehicle data if provided
      const vehicleData: any = values.vehicleId ? {
        vehicle_id: values.vehicleId,
        vehicleId: values.vehicleId,
        vehicle_make: values.vehicleMake,
        vehicleMake: values.vehicleMake,
        vehicle_model: values.vehicleModel,
        vehicleModel: values.vehicleModel,
        vehicleDetails: {
          make: values.vehicleMake,
          model: values.vehicleModel,
          year: values.vehicleYear,
          odometer: values.odometer,
          licensePlate: values.licensePlate,
        }
      } : {};
      
      // Map service category data
      const serviceCategoryData = values.serviceCategory ? {
        service_category: values.serviceCategory,
        serviceCategory: values.serviceCategory
      } : {};
      
      // Create the work order with additional tracking fields
      const newWorkOrder = await createWorkOrder({
        ...values,
        ...vehicleData,
        ...serviceCategoryData,
        dueDate: formattedDueDate,
        customer: values.customer,
        description: values.description,
        status: values.status,
        priority: values.priority,
        technician: values.technician,
        location: values.location,
        inventoryItems: inventoryItems,
        timeEntries: timeEntries,
        totalBillableTime,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        lastUpdatedBy: currentUser.name,
        lastUpdatedAt: new Date().toISOString(),
      });
      
      // Record the activity
      recordWorkOrderActivity(
        "Created", 
        newWorkOrder.id, 
        currentUser.id,
        currentUser.name
      );
      
      // Show success message
      toast({
        title: "Work Order Created",
        description: `Work order ${newWorkOrder.id} has been created successfully.`,
        variant: "success",
      });
      
      // Navigate to work orders list
      navigate("/work-orders");
    } catch (error) {
      console.error("Error creating work order:", error);
      
      // Handle specific network errors
      if (isNetworkError(error)) {
        handleNetworkError();
        setError("Network connectivity issue. Please check your internet connection.");
      } else {
        // Handle other form errors
        const errorResult = handleFormError(error, "Work Order");
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
    setTimeEntries,
    setFormValues,
  };
};
