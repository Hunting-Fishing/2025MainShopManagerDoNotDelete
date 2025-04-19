
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "../WorkOrderFormFields";

interface NotesFieldProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
}

export const NotesField: React.FC<NotesFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem className="col-span-1 md:col-span-2">
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter any additional notes here" 
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
