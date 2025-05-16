
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { CustomerFields } from "./form-fields/CustomerFields";
import { StatusFields } from "./form-fields/StatusFields";
import { AssignmentFields } from "./form-fields/AssignmentFields";
import { NotesField } from "./form-fields/NotesField";

// Define the form schema type to match what's used in WorkOrderEditForm
export type WorkOrderFormFieldValues = {
  customer: string;
  description: string;
  status: "pending" | "in-progress" | "on-hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  technician: string;
  location: string;
  dueDate: Date;
  notes?: string;
  inventoryItems?: any[];
};

interface WorkOrderFormFieldsProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
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
