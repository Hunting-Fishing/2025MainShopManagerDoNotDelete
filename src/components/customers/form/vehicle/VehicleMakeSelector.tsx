
import React from 'react';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control, FieldPath } from 'react-hook-form';

interface VehicleMakeSelectorProps<T> {
  name: FieldPath<T>;
  label?: string;
  control: Control<T>;
  makes: { make_id: string; make_display: string }[];
  onMakeChange: (make: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function VehicleMakeSelector<T>({
  name,
  label = 'Make',
  control,
  makes,
  onMakeChange,
  disabled = false,
  required = false,
  placeholder = 'Select make'
}: VehicleMakeSelectorProps<T>) {
  return (
    <FormItem>
      <FormLabel>{label} {required && <span className="text-red-500">*</span>}</FormLabel>
      <FormControl>
        <Select
          disabled={disabled}
          onValueChange={onMakeChange}
          name={name}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {makes.length > 0 ? (
              makes.map(make => {
                // Skip any empty values to avoid Radix UI error
                if (!make.make_id) return null;
                
                return (
                  <SelectItem key={make.make_id} value={make.make_id}>
                    {make.make_display || "Unknown Make"}
                  </SelectItem>
                );
              })
            ) : (
              <SelectItem value="no-makes-available">No makes available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
