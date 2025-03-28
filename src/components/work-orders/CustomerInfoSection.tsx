
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";

interface CustomerInfoSectionProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="customer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer</FormLabel>
            <FormControl>
              <Input placeholder="Enter customer name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="Enter location" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-1 md:col-span-2">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input placeholder="Brief description of the work" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
