
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "../WorkOrderFormFields";
import { WorkOrderInventorySectionContainer } from "./WorkOrderInventorySectionContainer";

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
}

export const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({ form }) => {
  return <WorkOrderInventorySectionContainer form={form} />;
};
