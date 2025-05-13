
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";

interface WorkOrderInfoSectionProps {
  form: UseFormReturn<WorkOrderFormValues>;
  serviceCategories: string[];
}

export const WorkOrderInfoSection: React.FC<WorkOrderInfoSectionProps> = ({ 
  form, 
  serviceCategories 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Description Field */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-full">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input 
                placeholder="Brief description of the work" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Service Category Field */}
      <FormField
        control={form.control}
        name="serviceCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Estimated Hours Field */}
      <FormField
        control={form.control}
        name="estimatedHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Hours</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0.5" 
                step="0.5" 
                placeholder="Estimated hours" 
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
