
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
import { CustomerInfoDisplay } from "./CustomerInfoDisplay";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { Customer } from "@/types/customer";

interface CustomerFieldsProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  prePopulatedCustomer?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    equipmentName?: string;
    equipmentType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleLicensePlate?: string;
    vehicleVin?: string;
  };
}

export const CustomerFields: React.FC<CustomerFieldsProps> = ({ 
  form, 
  prePopulatedCustomer 
}) => {
  const handleSelectCustomer = (customer: Customer | null) => {
    if (customer) {
      form.setValue("customer", `${customer.first_name} ${customer.last_name}`);
    } else {
      form.setValue("customer", "");
    }
  };

  // If we have pre-populated customer data, show the info display instead of search
  if (prePopulatedCustomer?.customerName) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer & Equipment Information</h3>
        <CustomerInfoDisplay {...prePopulatedCustomer} />
      </div>
    );
  }

  // Default customer search mode
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
      <div className="grid grid-cols-1 gap-4">
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
