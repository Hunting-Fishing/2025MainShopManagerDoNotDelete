
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Export the SelectOption interface
export interface SelectOption {
  value: string;
  label: string;
}

interface InventoryFormSelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[] | SelectOption[];
  error?: string;
  required?: boolean;
}

export function InventoryFormSelect({
  id,
  label,
  value,
  onValueChange,
  options,
  error,
  required,
}: InventoryFormSelectProps) {
  // Check if options are in SelectOption format or simple string array
  const isSelectOptionFormat = options.length > 0 && typeof options[0] !== 'string';
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center">
        {label}
      </Label>
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {isSelectOptionFormat ? 
            (options as SelectOption[]).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          :
            (options as string[]).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
