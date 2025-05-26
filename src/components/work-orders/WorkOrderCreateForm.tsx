
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkOrderFormFields } from "./WorkOrderFormFields";
import { WorkOrderInventorySection } from "./inventory/WorkOrderInventorySection";
import { VehicleFields } from "./form-fields/VehicleFields";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface WorkOrderCreateFormProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  onSubmit: (values: WorkOrderFormSchemaValues) => void;
}

export const WorkOrderCreateForm: React.FC<WorkOrderCreateFormProps> = ({
  form,
  onSubmit
}) => {
  // Mock technicians for demo purposes
  const technicians = ["John Smith", "Jane Doe", "Mike Johnson", "Sarah Wilson"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <WorkOrderFormFields form={form} technicians={technicians} />
        </Card>

        <VehicleFields form={form} />

        <WorkOrderInventorySection form={form} />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
            Create Work Order
          </Button>
        </div>
      </form>
    </Form>
  );
};
