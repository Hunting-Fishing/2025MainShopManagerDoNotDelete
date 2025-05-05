
import React from "react";
import { useWorkOrderForm } from "@/hooks/useWorkOrderForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { WorkOrderFormHeader } from "./WorkOrderFormHeader";
import { WorkOrderInfoSection } from "./fields/WorkOrderInfoSection";
import { CustomerInfo } from "./fields/CustomerInfo"; 
import { VehicleInfo } from "./fields/VehicleInfo";
import { NotesSection } from "./fields/NotesSection";
import { ScheduleSection } from "./fields/ScheduleSection";
import { WorkOrderTabs } from "./WorkOrderTabs";
import { useParams, useSearchParams } from "react-router-dom";
import { WorkOrderTemplate } from "@/types/workOrder";
import { toast } from "sonner";

interface WorkOrderFormProps {
  technicians: string[];
  initialTemplate?: WorkOrderTemplate | null;
  isLoadingTechnicians?: boolean;
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  technicians,
  isLoadingTechnicians = false,
  initialTemplate = null,
}) => {
  const { workOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!workOrderId;

  const { form, onSubmit, isSubmitting, error, setFormValues } = useWorkOrderForm();

  // Apply template when it changes
  React.useEffect(() => {
    if (initialTemplate) {
      setFormValues({
        description: initialTemplate.description || "",
        status: initialTemplate.status || "pending",
        priority: initialTemplate.priority || "medium", 
        technician: initialTemplate.technician || "",
        notes: initialTemplate.notes || "",
      });
      
      toast.success(`Applied template: ${initialTemplate.name}`, {
        description: "Template fields have been applied to the form",
      });
    }
  }, [initialTemplate, setFormValues]);

  // Apply pre-filled info from URL params
  React.useEffect(() => {
    const customerId = searchParams.get('customerId');
    const customerName = searchParams.get('customerName');
    const vehicleId = searchParams.get('vehicleId');
    const vehicleMake = searchParams.get('vehicleMake');
    const vehicleModel = searchParams.get('vehicleModel');
    const vehicleYear = searchParams.get('vehicleYear');
    
    if (customerId && customerName) {
      setFormValues({
        customer_id: customerId,
        customer: customerName,
      });
    }
    
    if (vehicleId) {
      setFormValues({
        vehicle_id: vehicleId,
        vehicleMake: vehicleMake || '',
        vehicleModel: vehicleModel || '',
        vehicleYear: vehicleYear || '',
      });
    }
  }, [searchParams, setFormValues]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <WorkOrderFormHeader 
          isEditing={isEditing} 
          isSubmitting={isSubmitting} 
          error={error}
        />

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <CustomerInfo form={form} />
              <VehicleInfo form={form} />
            </div>
            
            <div className="space-y-6">
              <WorkOrderInfoSection 
                form={form} 
                serviceCategories={[]} // We're no longer using this prop since we're fetching data directly
              />
              <ScheduleSection 
                form={form} 
                technicians={technicians}
                isLoading={isLoadingTechnicians} 
              />
            </div>
          </div>

          <NotesSection form={form} />

          <WorkOrderTabs />
        </div>
      </form>
    </Form>
  );
};
