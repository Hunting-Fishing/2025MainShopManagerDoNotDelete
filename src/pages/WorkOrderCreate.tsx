
import { useNavigate } from "react-router-dom";
import { Form } from "@/components/ui/form";
import { useWorkOrderForm } from "@/hooks/useWorkOrderForm";

// Import components
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { CustomerInfoSection } from "@/components/work-orders/CustomerInfoSection";
import { WorkOrderStatusSection } from "@/components/work-orders/WorkOrderStatusSection"; 
import { AssignmentSection } from "@/components/work-orders/AssignmentSection";
import { NotesSection } from "@/components/work-orders/NotesSection";
import { FormActions } from "@/components/work-orders/FormActions";

// Mock data for technicians
const technicians = [
  "Michael Brown",
  "Sarah Johnson",
  "David Lee",
  "Emily Chen",
  "Unassigned",
];

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const { form, onSubmit, isSubmitting } = useWorkOrderForm();

  return (
    <div className="space-y-6">
      {/* Header */}
      <WorkOrderFormHeader 
        title="Create Work Order" 
        description="Create a new work order for your team to complete."
      />

      {/* Form */}
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
    </div>
  );
}
