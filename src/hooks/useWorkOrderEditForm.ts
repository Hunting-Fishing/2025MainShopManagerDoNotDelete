
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkOrderFormSchemaValues, workOrderFormSchema } from "@/schemas/workOrderSchema";
import { toast } from "sonner";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { updateWorkOrder } from "@/utils/workOrders/crud";
import { normalizeWorkOrderStatus } from "@/utils/typeAdapters";

export function useWorkOrderEditForm(workOrder: WorkOrder) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder?.timeEntries || []);

  // Use the normalizer to ensure status is a valid type
  const normalizedStatus = normalizeWorkOrderStatus(workOrder?.status || "pending");

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: workOrder?.customer || "",
      description: workOrder?.description || "",
      status: normalizedStatus,
      priority: workOrder?.priority || "medium",
      technician: workOrder?.technician || "",
      location: workOrder?.location || "",
      // Convert string date to Date object for form
      dueDate: workOrder?.dueDate ? new Date(workOrder.dueDate) : new Date(),
      notes: workOrder?.notes || "",
      // Handle vehicle details with optional chaining
      vehicleMake: workOrder?.vehicle_make || workOrder?.vehicleMake || "",
      vehicleModel: workOrder?.vehicle_model || workOrder?.vehicleModel || "",
      vehicleYear: workOrder?.vehicle_year || "",
      odometer: workOrder?.odometer || "",
      licensePlate: workOrder?.licensePlate || "",
      vin: workOrder?.vin || "",
    },
  });

  const onSubmit = async (data: WorkOrderFormSchemaValues) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Prepare the data for updating the work order
      const updatedWorkOrderData: Partial<WorkOrder> = {
        id: workOrder.id,
        customer: data.customer,
        description: data.description,
        status: data.status,
        priority: data.priority as WorkOrder['priority'],
        technician: data.technician,
        location: data.location,
        // Convert Date to string
        dueDate: data.dueDate.toISOString().split('T')[0],
        notes: data.notes,
        // Use both snake_case and camelCase for compatibility
        vehicle_make: data.vehicleMake,
        vehicle_model: data.vehicleModel,
        vehicle_year: data.vehicleYear,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        odometer: data.odometer,
        licensePlate: data.licensePlate,
        vin: data.vin,
      };

      // Call the updateWorkOrder function
      const updatedWorkOrder = await updateWorkOrder(updatedWorkOrderData);

      if (updatedWorkOrder) {
        toast.success("Work order updated successfully");
        navigate(`/work-orders/${workOrder.id}`); // Navigate to the updated work order
      } else {
        setFormError("Failed to update work order. Please try again.");
        toast.error("Failed to update work order");
      }
    } catch (error) {
      console.error("Error updating work order:", error);
      setFormError("There was a problem updating the work order. Please try again.");
      toast.error("Failed to update work order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    formError,
    timeEntries,
    setTimeEntries,
  };
}
