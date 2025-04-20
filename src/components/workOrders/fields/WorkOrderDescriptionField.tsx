
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface WorkOrderDescriptionFieldProps {
  form: UseFormReturn<any>;
}

export const WorkOrderDescriptionField: React.FC<WorkOrderDescriptionFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Detailed Description</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Detailed description of the work to be performed"
              className="min-h-[120px]"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
