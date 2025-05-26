
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { WorkOrderInventoryField } from "./WorkOrderInventoryField";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({
  form
}) => {
  return (
    <Card className="p-6">
      <WorkOrderInventoryField form={form} />
    </Card>
  );
};
