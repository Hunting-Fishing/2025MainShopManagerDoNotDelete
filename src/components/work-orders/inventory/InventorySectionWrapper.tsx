
import React from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WorkOrderInventorySection } from "./WorkOrderInventorySection";

interface InventorySectionWrapperProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const InventorySectionWrapper: React.FC<InventorySectionWrapperProps> = ({
  form
}) => {
  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="text-lg font-medium mb-4">Parts & Materials</h3>
      <WorkOrderInventorySection form={form as any} />
    </div>
  );
};
