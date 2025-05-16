
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormErrors } from '@/hooks/inventory/useInventoryFormValidation';

interface InventoryFormFieldProps {
  label: string;
  name: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  step?: number;
  readOnly?: boolean;
}

export const InventoryFormField: React.FC<InventoryFormFieldProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  min,
  step,
  readOnly
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        min={min}
        step={step}
        readOnly={readOnly}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
