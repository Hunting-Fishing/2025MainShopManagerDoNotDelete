
import React, { useState } from "react";
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleSelectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      // Update form with customer data
      form.setValue("customer", `${customer.first_name} ${customer.last_name}`);
      
      // If customer has vehicles, populate vehicle information from the first vehicle
      if (customer.vehicles && customer.vehicles.length > 0) {
        const vehicle = customer.vehicles[0];
        form.setValue("vehicleMake", vehicle.make || "");
        form.setValue("vehicleModel", vehicle.model || "");
        form.setValue("vehicleYear", vehicle.year?.toString() || "");
        form.setValue("licensePlate", vehicle.license_plate || "");
        form.setValue("vin", vehicle.vin || "");
      }
    } else {
      form.setValue("customer", "");
      // Clear vehicle fields
      form.setValue("vehicleMake", "");
      form.setValue("vehicleModel", "");
      form.setValue("vehicleYear", "");
      form.setValue("licensePlate", "");
      form.setValue("vin", "");
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
                  selectedCustomer={selectedCustomer}
                  placeholder="Search for existing customer..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display selected customer's vehicles if any */}
        {selectedCustomer && selectedCustomer.vehicles && selectedCustomer.vehicles.length > 1 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">
              This customer has {selectedCustomer.vehicles.length} vehicles:
            </p>
            <div className="space-y-1">
              {selectedCustomer.vehicles.map((vehicle, index) => (
                <p key={vehicle.id} className="text-sm text-blue-700">
                  {index + 1}. {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.license_plate && ` (${vehicle.license_plate})`}
                </p>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              The first vehicle's information has been automatically filled in the vehicle section.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
