
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";
import { InventorySectionWrapper } from "./inventory/InventorySectionWrapper";

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({ form }) => {
  return <InventorySectionWrapper form={form} />;
};

export default WorkOrderInventorySection;
