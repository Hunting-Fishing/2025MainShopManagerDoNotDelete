
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { CustomerSearch } from "@/components/work-orders/customer-select/CustomerSearch";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { Customer } from "@/types/customer";

interface CustomerFieldsProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const CustomerFields: React.FC<CustomerFieldsProps> = ({ form }) => {
  const handleSelectCustomer = (customer: Customer | null) => {
    if (customer) {
      form.setValue("customer", `${customer.first_name} ${customer.last_name}`);
    } else {
      form.setValue("customer", "");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
      <div className="grid grid-cols-1 gap-4">
        {/* Customer Search Field */}
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <CustomerSearch
                  onSelectCustomer={handleSelectCustomer}
                  selectedCustomer={null}
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
