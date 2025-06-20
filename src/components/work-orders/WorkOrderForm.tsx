
import React from "react";
import { CreateWorkOrderTab } from "./details/CreateWorkOrderTab";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useState } from "react";
import { WorkOrderJobLine } from "@/types/jobLine";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface WorkOrderFormProps {
  onSubmit?: (values: any) => Promise<void>;
  initialValues?: any;
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
      ...initialValues,
      customer: prePopulatedCustomer?.customerName || initialValues.customer || "",
      customerEmail: prePopulatedCustomer?.customerEmail || initialValues.customerEmail || "",
      customerPhone: prePopulatedCustomer?.customerPhone || initialValues.customerPhone || "",
      customerAddress: prePopulatedCustomer?.customerAddress || initialValues.customerAddress || "",
      vehicleMake: prePopulatedCustomer?.vehicleMake || initialValues.vehicleMake || "",
      vehicleModel: prePopulatedCustomer?.vehicleModel || initialValues.vehicleModel || "",
      vehicleYear: prePopulatedCustomer?.vehicleYear || initialValues.vehicleYear || "",
      licensePlate: prePopulatedCustomer?.vehicleLicensePlate || initialValues.licensePlate || "",
      vin: prePopulatedCustomer?.vehicleVin || initialValues.vin || "",
      description: prePopulatedCustomer?.description || initialValues.description || "",
      priority: prePopulatedCustomer?.priority || initialValues.priority || "medium",
      status: initialValues.status || "pending",
      inventoryItems: initialValues.inventoryItems || [],
    },
  });

  const { technicians, isLoading: technicianLoading, error: technicianError } = useTechnicians();
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  
  const handleCreateWorkOrder = async (data: WorkOrderFormSchemaValues) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <CreateWorkOrderTab
      form={form}
      technicians={technicians}
      technicianLoading={technicianLoading}
      technicianError={technicianError}
      jobLines={jobLines}
      onJobLinesChange={setJobLines}
      prePopulatedCustomer={prePopulatedCustomer}
      onCreateWorkOrder={handleCreateWorkOrder}
      isEditMode={false}
    />
  );
};
