
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WorkOrderCreateForm } from "./WorkOrderCreateForm";

interface WorkOrderFormProps {
  onSubmit?: (values: WorkOrderFormSchemaValues) => void;
  initialValues?: Partial<WorkOrderFormSchemaValues>;
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  onSubmit,
  initialValues = {}
}) => {
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: "",
      description: "",
      status: "pending",
      priority: "medium",
      technician: "",
      location: "",
      dueDate: "",
      notes: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      odometer: "",
      licensePlate: "",
      vin: "",
      inventoryItems: [],
      ...initialValues
    }
  });

  const handleSubmit = (values: WorkOrderFormSchemaValues) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return <WorkOrderCreateForm form={form} onSubmit={handleSubmit} />;
};
