
import React from 'react';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control, FieldPath } from 'react-hook-form';

interface VehicleModelSelectorProps<T> {
  name: FieldPath<T>;
  label?: string;
  control: Control<T>;
  models: string[];
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function VehicleModelSelector<T>({
  name,
  label = 'Model',
  control,
  models,
  disabled = false,
  loading = false,
  required = false,
  placeholder = 'Select model'
}: VehicleModelSelectorProps<T>) {
  return (
    <FormItem>
      <FormLabel>{label} {required && <span className="text-red-500">*</span>}</FormLabel>
      <FormControl>
        <Select disabled={disabled || loading} name={name}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <SelectItem value="loading">Loading models...</SelectItem>
            ) : models.length > 0 ? (
              models.map(model => model ? (
                <SelectItem key={model} value={model}>
                  {model || "Unknown Model"}
                </SelectItem>
              ) : null)
            ) : (
              <SelectItem value="no-models">No models available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
