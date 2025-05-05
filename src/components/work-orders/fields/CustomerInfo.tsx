
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Customer, CustomerVehicle } from "@/types/customer";
import { CustomerSearch } from "../customer-select/CustomerSearch";
import { VehicleSelect } from "../customer-select/VehicleSelect";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

interface CustomerInfoProps {
  form: any;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ form }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(null);

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    
    if (customer) {
      // Update form values
      form.setValue('customer', `${customer.first_name} ${customer.last_name}`);
      form.setValue('customer_id', customer.id);
      
      // Set location if customer has address
      if (customer.address) {
        const addressParts = [];
        if (customer.address) addressParts.push(customer.address);
        if (customer.city) addressParts.push(customer.city);
        if (customer.state) addressParts.push(customer.state);
        if (customer.postal_code) addressParts.push(customer.postal_code);
        
        form.setValue('location', addressParts.join(', '));
      }
    } else {
      // Clear form values
      form.setValue('customer', '');
      form.setValue('customer_id', '');
      form.setValue('location', '');
      form.setValue('vehicle_id', '');
      form.setValue('vehicleMake', '');
      form.setValue('vehicleModel', '');
      form.setValue('vehicleYear', '');
      
      // Reset vehicle selection
      setSelectedVehicle(null);
    }
  };

  // Handle vehicle selection
  const handleSelectVehicle = (vehicle: CustomerVehicle | null) => {
    setSelectedVehicle(vehicle);
    
    if (vehicle) {
      form.setValue('vehicle_id', vehicle.id);
      form.setValue('vehicleMake', vehicle.make || '');
      form.setValue('vehicleModel', vehicle.model || '');
      form.setValue('vehicleYear', vehicle.year?.toString() || '');
    } else {
      form.setValue('vehicle_id', '');
      form.setValue('vehicleMake', '');
      form.setValue('vehicleModel', '');
      form.setValue('vehicleYear', '');
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Customer Information
        </h3>
        
        <div className="space-y-4">
          {/* Customer Search */}
          <div className="relative">
            <FormLabel className="mb-2 block">Customer</FormLabel>
            <CustomerSearch 
              onSelectCustomer={handleSelectCustomer}
              selectedCustomer={selectedCustomer}
            />
            {/* Hidden field for form submission */}
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
          </div>

          {/* Vehicle Selection */}
          <div>
            <FormLabel className="mb-2 block">Vehicle</FormLabel>
            <VehicleSelect
              customerId={selectedCustomer?.id || null}
              onSelectVehicle={handleSelectVehicle}
              selectedVehicleId={selectedVehicle?.id}
            />
            {/* Hidden field for form submission */}
            <FormField
              control={form.control}
              name="vehicle_id"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
          </div>

          {/* Location Field */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Service location" className="bg-white dark:bg-slate-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCustomer && !selectedVehicle && (
            <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md text-sm">
              <InfoIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>No vehicles found for this customer. You can continue without selecting a vehicle.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
