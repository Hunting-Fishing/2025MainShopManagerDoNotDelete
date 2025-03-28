
import React from "react";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useWorkOrderForm, WorkOrderFormValues } from "@/hooks/useWorkOrderForm";

// Import components
import { CustomerInfoSection } from "@/components/work-orders/CustomerInfoSection";
import { WorkOrderStatusSection } from "@/components/work-orders/WorkOrderStatusSection";
import { AssignmentSection } from "@/components/work-orders/AssignmentSection";
import { NotesSection } from "@/components/work-orders/NotesSection";
import { FormActions } from "@/components/work-orders/FormActions";

interface WorkOrderFormProps {
  technicians: string[];
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ technicians }) => {
  const navigate = useNavigate();
  const { form, onSubmit, isSubmitting } = useWorkOrderForm();

  return (
    <div className="rounded-lg border border-slate-200 p-6 bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <CustomerInfoSection form={form} />
            
            {/* Status & Priority */}
            <WorkOrderStatusSection form={form} />
            
            {/* Assignment */}
            <AssignmentSection form={form} technicians={technicians} />
            
            {/* Notes */}
            <NotesSection form={form} />
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
