
import React from 'react';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control, FieldPath } from 'react-hook-form';

interface VehicleModelSelectorProps<T> {
  name: FieldPath<T>;
  label?: string;
  control: Control<T>;
  models: { model_name: string; model_make_id: string }[];
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
            ) : models && models.length > 0 ? (
              models.map(model => {
                // Skip any empty values to avoid Radix UI error
                if (!model.model_name) return null;
                
                return (
                  <SelectItem key={model.model_name} value={model.model_name}>
                    {model.model_name || "Unknown Model"}
                  </SelectItem>
                );
              })
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
