
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface NotesFieldProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const NotesField: React.FC<NotesFieldProps> = ({ form }) => {
  return (
    <div className="col-span-full">
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add any additional notes about this work order..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
