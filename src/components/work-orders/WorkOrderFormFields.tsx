
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFields } from "./form-fields/CustomerFields";
import { ServicesSection } from "./form-fields/ServicesSection";
import { StatusFields } from "./form-fields/StatusFields";
import { AssignmentFields } from "./form-fields/AssignmentFields";
import { NotesField } from "./form-fields/NotesField";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface WorkOrderFormFieldsProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  technicians: string[];
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
  prePopulatedCustomer
}) => {
  return (
    <div className="space-y-6">
      <CustomerFields form={form} prePopulatedCustomer={prePopulatedCustomer} />
      <ServicesSection form={form} />
      <StatusFields form={form} />
      <AssignmentFields form={form} technicians={technicians} />
      <NotesField form={form} />
    </div>
  );
};
