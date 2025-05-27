
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface CustomerFieldsProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const CustomerFields: React.FC<CustomerFieldsProps> = ({ form }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Field */}
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter customer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Work Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the work to be performed"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
