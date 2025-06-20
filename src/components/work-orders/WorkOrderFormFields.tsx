
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFields } from "./form-fields/CustomerFields";
import { ServicesSection } from "./form-fields/ServicesSection";
import { StatusFields } from "./form-fields/StatusFields";
import { AssignmentFields } from "./form-fields/AssignmentFields";
import { NotesField } from "./form-fields/NotesField";
import { JobLinesSection } from "./form-fields/JobLinesSection";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WorkOrderJobLine } from "@/types/jobLine";

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

interface WorkOrderFormFieldsProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  technicians: Technician[];
  technicianLoading: boolean;
  technicianError: string | null;
  jobLines?: WorkOrderJobLine[];
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  workOrderId?: string;
  shopId?: string;
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

export const WorkOrderFormFields: React.FC<WorkOrderFormFieldsProps> = ({
  form,
  technicians,
  technicianLoading,
  technicianError,
  jobLines = [],
  onJobLinesChange,
  workOrderId = `temp-${Date.now()}`,
  shopId,
  prePopulatedCustomer
}) => {
  const description = form.watch('description');

  // Create a wrapper function that matches the expected signature
  const handleJobLinesChange = async () => {
    // This function doesn't need to do anything special for the form fields
    // The actual job lines changes are handled by the parent component
    return Promise.resolve();
  };

  return (
    <div className="space-y-6">
      <CustomerFields form={form} prePopulatedCustomer={prePopulatedCustomer} />
      <ServicesSection form={form} />
      
      {/* Job Lines Section - Only show if description is provided */}
      {description && onJobLinesChange && (
        <JobLinesSection
          workOrderId={workOrderId}
          description={description}
          jobLines={jobLines}
          onJobLinesChange={handleJobLinesChange}
          isEditMode={true}
          shopId={shopId}
        />
      )}
      
      <StatusFields form={form} />
      <AssignmentFields 
        form={form} 
        technicians={technicians}
        technicianLoading={technicianLoading}
        technicianError={technicianError}
      />
      <NotesField form={form} />
    </div>
  );
};
