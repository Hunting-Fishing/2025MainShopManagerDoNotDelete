import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { createWorkOrder } from "@/utils/workOrders";
import { format } from "date-fns";
import { WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { recordWorkOrderActivity } from "@/utils/workOrders/activity";
import { handleFormError, isNetworkError, handleNetworkError } from "@/utils/errorHandling";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

export type WorkOrderFormValues = WorkOrderFormSchemaValues;

const currentUser = { id: "user-123", name: "Admin User" };

export const useWorkOrderForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

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

  const setFormValues = (values: Partial<WorkOrderFormSchemaValues>) => {
    Object.entries(values).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
  };

  const onSubmit = async (values: WorkOrderFormSchemaValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!navigator.onLine) {
        setError("No internet connection. Please check your network and try again.");
        throw new Error("Network offline");
      }
      
      const formattedDueDate = format(values.dueDate, "yyyy-MM-dd");
      
      const inventoryItems: WorkOrderInventoryItem[] = values.inventoryItems?.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })) || [];
      
      const totalBillableTime = timeEntries.reduce((total, entry) => {
        return entry.billable ? total + entry.duration : total;
      }, 0);
      
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
      
      const serviceCategoryData = values.serviceCategory ? {
        service_category: values.serviceCategory,
        serviceCategory: values.serviceCategory
      } : {};
      
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
      
      recordWorkOrderActivity(
        "Created", 
        newWorkOrder.id, 
        currentUser.id,
        currentUser.name
      );
      
      toast({
        title: "Work Order Created",
        description: `Work order ${newWorkOrder.id} has been created successfully.`,
        variant: "success",
      });
      
      navigate("/work-orders");
    } catch (error) {
      console.error("Error creating work order:", error);
      
      if (isNetworkError(error)) {
        handleNetworkError();
        setError("Network connectivity issue. Please check your internet connection.");
      } else {
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
