
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WorkOrderCreateForm } from "./WorkOrderCreateForm";

interface WorkOrderFormProps {
  onSubmit?: (values: WorkOrderFormSchemaValues) => Promise<void>;
  initialValues?: Partial<WorkOrderFormSchemaValues>;
  prePopulatedCustomer?: {
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    title?: string;
    description?: string;
    priority?: string;
    equipmentName?: string;
    equipmentType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleLicensePlate?: string;
    vehicleVin?: string;
  };
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  onSubmit,
  initialValues = {},
  prePopulatedCustomer
}) => {
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: prePopulatedCustomer?.customerName || "",
      description: prePopulatedCustomer?.description || "",
      status: "pending",
      priority: (prePopulatedCustomer?.priority as any) || "medium",
      technician: "",
      location: "",
      dueDate: "",
      notes: "",
      vehicleMake: prePopulatedCustomer?.vehicleMake || "",
      vehicleModel: prePopulatedCustomer?.vehicleModel || "",
      vehicleYear: prePopulatedCustomer?.vehicleYear || "",
      odometer: "",
      licensePlate: prePopulatedCustomer?.vehicleLicensePlate || "",
      vin: prePopulatedCustomer?.vehicleVin || "",
      inventoryItems: [],
      ...initialValues
    }
  });

  const handleSubmit = async (values: WorkOrderFormSchemaValues) => {
    if (onSubmit) {
      await onSubmit(values);
    }
  };

  return <WorkOrderCreateForm form={form} onSubmit={handleSubmit} prePopulatedCustomer={prePopulatedCustomer} />;
};
