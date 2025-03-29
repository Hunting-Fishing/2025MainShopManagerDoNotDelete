
import React from "react";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useWorkOrderForm } from "@/hooks/useWorkOrderForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Import components
import { CustomerInfoSection } from "@/components/work-orders/CustomerInfoSection";
import { WorkOrderStatusSection } from "@/components/work-orders/WorkOrderStatusSection";
import { AssignmentSection } from "@/components/work-orders/AssignmentSection";
import { NotesSection } from "@/components/work-orders/NotesSection";
import { WorkOrderInventorySection } from "@/components/work-orders/inventory/WorkOrderInventorySection";
import { FormActions } from "@/components/work-orders/FormActions";

interface WorkOrderFormProps {
  technicians: string[];
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ technicians }) => {
  const navigate = useNavigate();
  const { form, onSubmit, isSubmitting, error } = useWorkOrderForm();

  return (
    <div className="rounded-lg border border-slate-200 p-6 bg-white">
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
            <WorkOrderInventorySection form={form as any} />
          </div>

          {/* Form Actions */}
          <FormActions 
            isSubmitting={isSubmitting} 
            onCancel={() => navigate("/work-orders")} 
          />
        </form>
      </Form>
    </div>
  );
};
