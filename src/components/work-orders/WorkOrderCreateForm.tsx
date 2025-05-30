
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFields } from "./WorkOrderFormFields";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface WorkOrderCreateFormProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  onSubmit: (values: WorkOrderFormSchemaValues) => Promise<void>;
  prePopulatedCustomer?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
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
  
  // Mock technicians data - in a real app this would come from an API
  const technicians = [
    "John Smith",
    "Sarah Johnson", 
    "Mike Wilson",
    "Lisa Davis"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <WorkOrderFormFields 
          form={form} 
          technicians={technicians}
          prePopulatedCustomer={prePopulatedCustomer}
        />
        
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline">
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
