
import React from 'react';
import { Label } from '@/components/ui/label';

interface SelectOption {
  value: string;
  label: string;
}

interface InventoryFormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
}

export const InventoryFormSelect: React.FC<InventoryFormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  options,
  required = false,
  placeholder = "Select an option"
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full border rounded p-2 ${error ? "border-red-500" : "border-gray-300"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
