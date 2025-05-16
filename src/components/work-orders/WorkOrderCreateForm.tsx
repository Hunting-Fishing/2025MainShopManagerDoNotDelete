
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomerDetailsField } from "./fields/CustomerDetailsField";
import { VehicleDetailsField } from "./fields/VehicleDetailsField";
import { WorkOrderDetailsField } from "./fields/WorkOrderDetailsField";
import { AssignmentSection } from "./AssignmentSection";
import { NotesSection } from "./NotesSection";
import { TimeEntrySection } from "./TimeEntrySection";
import { InventorySectionWrapper } from "./inventory/InventorySectionWrapper";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface WorkOrderCreateFormProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  onSubmit: (values: WorkOrderFormSchemaValues) => Promise<any>;
  isLoading: boolean;
}

export const WorkOrderCreateForm: React.FC<WorkOrderCreateFormProps> = ({ 
  form, 
  onSubmit, 
  isLoading 
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-4 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerDetailsField form={form} />
            <VehicleDetailsField form={form} />
          </div>
        </Card>
        
        <WorkOrderDetailsField form={form} />
        
        <AssignmentSection form={form} />
        
        <NotesSection form={form} />
        
        <TimeEntrySection form={form} />
        
        <InventorySectionWrapper 
          form={form as any} 
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Creating..." : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
