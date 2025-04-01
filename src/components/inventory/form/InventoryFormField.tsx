
import React from "react";
import { FormField } from "@/components/ui/form-field";

interface InventoryFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
}

export function InventoryFormField({
  label,
  error,
  description,
  required = false,
  ...props
}: InventoryFormFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
      {...props}
    />
  );
}
