
import React from "react";
import { CreateWorkOrderTab } from "./details/CreateWorkOrderTab";
import { useWorkOrderFormSchema } from "@/schemas/workOrderSchema";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useState } from "react";
import { WorkOrderJobLine } from "@/types/jobLine";

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
  const form = useWorkOrderFormSchema(initialValues);
  const { technicians, isLoading: technicianLoading, error: technicianError } = useTechnicians();
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  
  const handleCreateWorkOrder = async (data: any) => {
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
