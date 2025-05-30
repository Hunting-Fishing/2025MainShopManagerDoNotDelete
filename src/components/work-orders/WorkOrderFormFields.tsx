
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFields } from "./form-fields/CustomerFields";
import { ServicesSection } from "./form-fields/ServicesSection";
import { StatusFields } from "./form-fields/StatusFields";
import { AssignmentFields } from "./form-fields/AssignmentFields";
import { NotesField } from "./form-fields/NotesField";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

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
  prePopulatedCustomer
}) => {
  return (
    <div className="space-y-6">
      <CustomerFields form={form} prePopulatedCustomer={prePopulatedCustomer} />
      <ServicesSection form={form} />
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
