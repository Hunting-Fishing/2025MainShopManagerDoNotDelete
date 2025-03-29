
import React from "react";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Import components
import { CustomerInfoSection } from "@/components/work-orders/CustomerInfoSection";
import { WorkOrderStatusSection } from "@/components/work-orders/WorkOrderStatusSection";
import { AssignmentSection } from "@/components/work-orders/AssignmentSection";
import { NotesSection } from "@/components/work-orders/NotesSection";
import { WorkOrderInventoryField } from "@/components/work-orders/inventory/WorkOrderInventoryField";
import { EditFormActions } from "@/components/work-orders/edit/EditFormActions";

interface WorkOrderEditFormContentProps {
  workOrderId: string;
  technicians: string[];
  form: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  error?: string | null;
}

export const WorkOrderEditFormContent: React.FC<WorkOrderEditFormContentProps> = ({
  workOrderId,
  technicians,
  form,
  onSubmit,
  isSubmitting,
  error
}) => {
  return (
    <Card className="p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <CustomerInfoSection form={form as any} />
            
            {/* Status & Priority */}
            <WorkOrderStatusSection form={form as any} />
            
            {/* Assignment */}
            <AssignmentSection form={form as any} technicians={technicians} />
            
            {/* Notes */}
            <NotesSection form={form as any} />

            {/* Inventory Items */}
            <WorkOrderInventoryField form={form as any} />
          </div>

          {/* Form Actions */}
          <EditFormActions 
            workOrderId={workOrderId}
            isSubmitting={isSubmitting} 
          />
        </form>
      </Form>
    </Card>
  );
};
