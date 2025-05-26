
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/types/workOrder"; // Updated import
import { InventorySectionWrapper } from "./inventory/InventorySectionWrapper";

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({ form }) => {
  return <InventorySectionWrapper form={form as any} />;
};

export default WorkOrderInventorySection;
