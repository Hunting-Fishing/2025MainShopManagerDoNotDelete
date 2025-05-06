
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface InventoryFormSelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
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
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
