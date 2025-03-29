
import React from "react";
import { WorkOrderInventoryField } from "./WorkOrderInventoryField";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "../WorkOrderFormFields";

interface InventoryItemsSectionProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
}

export const InventoryItemsSection: React.FC<InventoryItemsSectionProps> = ({ 
  form 
}) => {
  return <WorkOrderInventoryField form={form} />;
};
