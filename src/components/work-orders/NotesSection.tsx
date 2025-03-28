
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";

interface NotesSectionProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem className="col-span-1 md:col-span-2">
          <FormLabel>Additional Notes</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter any additional details or instructions"
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
