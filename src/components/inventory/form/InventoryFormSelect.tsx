
import React from "react";
import { SelectOption } from "./InventoryFormProps";

interface InventoryFormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: SelectOption[];
  required?: boolean;
  error?: string;
}

export const InventoryFormSelect: React.FC<InventoryFormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleSelectChange}
        className={`w-full border rounded p-2 ${error ? "border-red-500" : "border-gray-300"}`}
        required={required}
      >
        <option value="">Select {label}</option>
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
