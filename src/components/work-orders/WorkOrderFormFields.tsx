
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
}

export const WorkOrderFormFields: React.FC<WorkOrderFormFieldsProps> = ({
  form,
  technicians
}) => {
  return (
    <div className="space-y-6">
      <CustomerFields form={form} />
      <ServicesSection form={form} />
      <StatusFields form={form} />
      <AssignmentFields form={form} technicians={technicians} />
      <NotesField form={form} />
    </div>
  );
};
