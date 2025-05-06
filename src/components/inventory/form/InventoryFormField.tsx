
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InventoryFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  description?: string;
}

export function InventoryFormField({
  label,
  name,
  error,
  required,
  description,
  ...props
}: InventoryFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center">
        {label}
      </Label>
      
      <Input 
        id={name}
        name={name}
        className={error ? "border-red-500" : ""}
        {...props}
      />
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
