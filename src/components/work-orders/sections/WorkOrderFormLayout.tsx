
import React from 'react';
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { VehicleDetailsField } from "../fields/VehicleDetailsField";
import { CommonServicesChecklist } from "../fields/CommonServicesChecklist";
import { CustomerInfoSection } from "../CustomerInfoSection";
import { WorkOrderStatusSection } from "../WorkOrderStatusSection";
import { AssignmentSection } from "../AssignmentSection";
import { WorkOrderDescriptionField } from "../fields/WorkOrderDescriptionField";
import { NotesSection } from "../NotesSection";
import { WorkOrderInventorySection } from "../WorkOrderInventorySection";
import { TimeTrackingSection } from "./TimeTrackingSection";
import { SaveAsTemplateDialog } from "../templates/SaveAsTemplateDialog";
import { FormActions } from "../FormActions";

interface WorkOrderFormLayoutProps {
  form: UseFormReturn<WorkOrderFormValues>;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (values: WorkOrderFormValues) => Promise<void>;
  onCancel: () => void;
  customers: any[];
  loadingCustomers: boolean;
  technicians: string[];
  loadingTechnicians: boolean;
  selectedVehicleId: string | null;
  customerId: string | null;
  vehicleId: string | null;
  vehicleInfo: string | null;
  isFleetCustomer: boolean;
  timeEntries: any[];
  onUpdateTimeEntries: (entries: any[]) => void;
  onSaveTemplate: (template: any) => void;
  onServiceChecked: (services: string[]) => void;
}

export const WorkOrderFormLayout: React.FC<WorkOrderFormLayoutProps> = ({
  form,
  error,
  isSubmitting,
  onSubmit,
  onCancel,
  customers,
  loadingCustomers,
  technicians,
  loadingTechnicians,
  selectedVehicleId,
  customerId,
  vehicleId,
  vehicleInfo,
  isFleetCustomer,
  timeEntries,
  onUpdateTimeEntries,
  onSaveTemplate,
  onServiceChecked,
}) => {
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
          {vehicleId && vehicleInfo && (
            <VehicleDetailsField 
              form={form} 
              isFleetCustomer={isFleetCustomer} 
            />
          )}
          
          <CommonServicesChecklist onServiceChecked={onServiceChecked} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomerInfoSection 
              form={form} 
              customers={customers} 
              isLoading={loadingCustomers} 
              selectedVehicleId={selectedVehicleId}
              preSelectedCustomerId={customerId}
            />
            
            <WorkOrderStatusSection form={form} />
            
            <AssignmentSection 
              form={form} 
              technicians={technicians} 
              isLoading={loadingTechnicians}
            />
            
            <div className="col-span-1 md:col-span-2">
              <WorkOrderDescriptionField form={form} />
            </div>
            
            <NotesSection form={form} />

            <WorkOrderInventorySection form={form} />
          </div>

          <TimeTrackingSection 
            timeEntries={timeEntries}
            onUpdateTimeEntries={onUpdateTimeEntries}
          />

          <div className="flex justify-between items-center">
            <SaveAsTemplateDialog 
              formValues={form.getValues()} 
              onSave={onSaveTemplate} 
            />
            <FormActions 
              isSubmitting={isSubmitting} 
              onCancel={onCancel} 
            />
          </div>
        </form>
      </Form>
    </div>
  );
};
