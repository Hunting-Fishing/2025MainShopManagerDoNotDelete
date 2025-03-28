
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { WorkOrderFormFields } from "../WorkOrderFormFields";
import { WorkOrderInventorySection } from "../inventory/WorkOrderInventorySection";
import { EditFormActions } from "./EditFormActions";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { UseFormReturn } from "react-hook-form";

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Fields */}
            <WorkOrderFormFields form={form as any} technicians={technicians} />
            
            {/* Inventory Items Section */}
            <WorkOrderInventorySection form={form as any} />

            {/* Form Actions */}
            <EditFormActions 
              workOrderId={workOrderId} 
              isSubmitting={isSubmitting} 
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
