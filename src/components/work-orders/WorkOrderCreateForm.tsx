
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFields } from "./WorkOrderFormFields";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { useTechnicians } from "@/hooks/useTechnicians";

interface WorkOrderCreateFormProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  onSubmit: (values: WorkOrderFormSchemaValues) => Promise<void>;
  prePopulatedCustomer?: {
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    title?: string;
    description?: string;
    priority?: string;
    equipmentName?: string;
    equipmentType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleLicensePlate?: string;
    vehicleVin?: string;
  };
}

export const WorkOrderCreateForm: React.FC<WorkOrderCreateFormProps> = ({
  form,
  onSubmit,
  prePopulatedCustomer
}) => {
  const isSubmitting = form.formState.isSubmitting;
  const { technicians, isLoading: technicianLoading, error: technicianError } = useTechnicians();

  const handleSaveDraft = () => {
    // TODO: Implement save as draft functionality
    console.log('Save as draft functionality to be implemented');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <WorkOrderFormFields 
          form={form} 
          technicians={technicians}
          technicianLoading={technicianLoading}
          technicianError={technicianError}
          prePopulatedCustomer={prePopulatedCustomer}
        />
        
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Work Order...
              </>
            ) : (
              "Create Work Order"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
