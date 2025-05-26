
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { InventorySectionWrapper } from "./inventory/InventorySectionWrapper";

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({ form }) => {
  return <InventorySectionWrapper form={form as any} />;
};

export default WorkOrderInventorySection;
