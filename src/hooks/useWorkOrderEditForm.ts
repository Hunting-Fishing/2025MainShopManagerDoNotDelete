import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkOrderFormSchemaValues, workOrderFormSchema } from "@/schemas/workOrderSchema";
import { toast } from "sonner";
import { WorkOrder } from "@/types/workOrder";
import { updateWorkOrder } from "@/utils/workOrders/crud";

export function useWorkOrderEditForm(workOrder: WorkOrder) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: workOrder?.customer || "",
      description: workOrder?.description || "",
      status: workOrder?.status || "pending",
      priority: workOrder?.priority || "medium",
      technician: workOrder?.technician || "",
      location: workOrder?.location || "",
      dueDate: new Date(workOrder?.dueDate || new Date()).toISOString(),
      notes: workOrder?.notes || "",
      vehicleMake: workOrder?.vehicleMake || "",
      vehicleModel: workOrder?.vehicleModel || "",
      vehicleYear: workOrder?.vehicleYear || "",
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
        id: workOrder.id, // Ensure you have the ID of the work order
        customer: data.customer,
        description: data.description,
        status: data.status,
        priority: data.priority,
        technician: data.technician,
        location: data.location,
        dueDate: data.dueDate,
        notes: data.notes,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
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
  };
}
