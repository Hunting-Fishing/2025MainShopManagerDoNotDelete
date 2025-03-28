
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrderFormFields } from "../WorkOrderFormFields";
import { EditFormActions } from "./EditFormActions";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { UseFormReturn } from "react-hook-form";
import { EditFormWrapper } from "./EditFormWrapper";
import { InventorySectionWrapper } from "../inventory/InventorySectionWrapper";

interface WorkOrderEditFormContentProps {
  workOrderId: string;
  technicians: string[];
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  onSubmit: (values: WorkOrderFormSchemaValues) => Promise<void>;
  isSubmitting: boolean;
}

export const WorkOrderEditFormContent: React.FC<WorkOrderEditFormContentProps> = ({
  workOrderId,
  technicians,
  form,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-lg">Work Order Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <EditFormWrapper form={form} onSubmit={onSubmit}>
          {/* Form Fields */}
          <WorkOrderFormFields form={form as any} technicians={technicians} />
          
          {/* Inventory Items Section */}
          <InventorySectionWrapper form={form} />

          {/* Form Actions */}
          <EditFormActions 
            workOrderId={workOrderId} 
            isSubmitting={isSubmitting} 
          />
        </EditFormWrapper>
      </CardContent>
    </Card>
  );
};
