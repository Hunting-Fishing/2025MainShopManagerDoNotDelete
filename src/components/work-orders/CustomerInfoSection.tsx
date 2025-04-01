
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";
import { Customer } from "@/types/customer";

interface CustomerInfoSectionProps {
  form: UseFormReturn<WorkOrderFormValues>;
  customers: Customer[];
  isLoading: boolean;
}

export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({ form, customers, isLoading }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="customer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Loading customers...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select a customer" />
                  )}
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem 
                    key={customer.id} 
                    value={`${customer.first_name} ${customer.last_name}`}
                  >
                    {customer.first_name} {customer.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {customers.length === 0 && !isLoading && (
              <FormDescription className="text-amber-600">
                No customers found. Please add a customer first.
              </FormDescription>
            )}
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
