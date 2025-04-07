
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { createWorkOrder } from "@/utils/workOrderUtils";
import { format } from "date-fns";
import { WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { recordWorkOrderActivity } from "@/utils/activity/workOrderActivity";
import { handleFormError, isNetworkError, handleNetworkError } from "@/utils/errorHandling";

// Mock current user - in a real app, this would come from auth context
const currentUser = { id: "user-123", name: "Admin User" };

// Define inventory item schema using the type
const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number()
});

// Form schema validation - enhanced with new fields
const formSchema = z.object({
  customer: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  serviceCategory: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed", "cancelled"], {
    required_error: "Please select a status.",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority.",
  }),
  technician: z.string().min(1, {
    message: "Please select a technician.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  dueDate: z.date({
    required_error: "Due date is required.",
  }),
  notes: z.string().optional(),
  inventoryItems: z.array(inventoryItemSchema).optional(),
  // New vehicle fields
  vehicleId: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  odometer: z.string().optional(),
  licensePlate: z.string().optional(),
});

export type WorkOrderFormValues = z.infer<typeof formSchema>;

export const useWorkOrderForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Initialize the form
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(formSchema),
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
  const setFormValues = (values: Partial<WorkOrderFormValues>) => {
    Object.entries(values).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
  };

  // Handle form submission
  const onSubmit = async (values: WorkOrderFormValues) => {
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
      const vehicleData = values.vehicleId ? {
        vehicleId: values.vehicleId,
        vehicleDetails: {
          make: values.vehicleMake,
          model: values.vehicleModel,
          year: values.vehicleYear,
          odometer: values.odometer,
          licensePlate: values.licensePlate,
        }
      } : {};
      
      // Create the work order with additional tracking fields
      const newWorkOrder = await createWorkOrder({
        ...values,
        ...vehicleData,
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
        serviceCategory: values.serviceCategory
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
