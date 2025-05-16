
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFields } from "./form-fields/CustomerFields";
import { StatusFields } from "./form-fields/StatusFields";
import { AssignmentFields } from "./form-fields/AssignmentFields";
import { NotesField } from "./form-fields/NotesField";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

// Updated to use the WorkOrderFormSchemaValues for compatibility
export type WorkOrderFormFieldValues = WorkOrderFormSchemaValues;

interface WorkOrderFormFieldsProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  technicians: string[];
}

export const WorkOrderFormFields: React.FC<WorkOrderFormFieldsProps> = ({
  form,
  technicians
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Customer Fields */}
      <CustomerFields form={form} />

      {/* Status Fields */}
      <StatusFields form={form} />

      {/* Assignment Fields */}
      <AssignmentFields form={form} technicians={technicians} />

      {/* Notes Field */}
      <NotesField form={form} />
    </div>
  );
};
