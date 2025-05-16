
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

interface WorkOrderFormValues {
  customer: string;
  customer_id?: string;
  vehicle?: string;
  vehicle_id?: string;
  description: string;
  status: string;
  priority: string;
  technician?: string;
  technician_id?: string;
  service_date?: string;
  notes: string;
  timeEntries: any[];
  inventoryItems: any[];
}

interface WorkOrderCreateFormProps {
  form: UseFormReturn<WorkOrderFormValues>;
  onSubmit: (values: WorkOrderFormValues) => Promise<any>;
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
        
        <InventorySectionWrapper form={form} />
        
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
