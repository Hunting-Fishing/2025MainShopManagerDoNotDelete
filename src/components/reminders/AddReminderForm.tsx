
import { Form } from "@/components/ui/form";
import { useReminderForm } from "./hooks/useReminderForm";
import { CustomerVehicleFields } from "./form-fields/CustomerVehicleFields";
import { ReminderTypeField } from "./form-fields/ReminderTypeField";
import { ReminderDetailsFields } from "./form-fields/ReminderDetailsFields";
import { DueDateField } from "./form-fields/DueDateField";
import { FormActions } from "./form-fields/FormActions";

interface AddReminderFormProps {
  customerId?: string;
  vehicleId?: string;
  onSuccess?: () => void;
}

export function AddReminderForm({ customerId, vehicleId, onSuccess }: AddReminderFormProps) {
  const { form, isSubmitting, onSubmit } = useReminderForm({
    customerId,
    vehicleId,
    onSuccess,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomerVehicleFields 
          form={form} 
          customerId={customerId} 
          vehicleId={vehicleId} 
        />
        
        <ReminderTypeField form={form} />
        
        <ReminderDetailsFields form={form} />
        
        <DueDateField form={form} />
        
        <FormActions isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
}
