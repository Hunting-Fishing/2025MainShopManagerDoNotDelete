
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Car, Plus } from "lucide-react";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { CustomerSearchInput } from "@/components/customers/CustomerSearchInput";
import { VehicleSelect } from "@/components/work-orders/customer-select/VehicleSelect";
import { Customer, CustomerVehicle } from "@/types/customer";

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
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(null);
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);

  // Set initial customer if pre-populated
  useEffect(() => {
    if (prePopulatedCustomer?.customerName) {
      form.setValue('customer', prePopulatedCustomer.customerName);
      form.setValue('customerEmail', prePopulatedCustomer.customerEmail || '');
      form.setValue('customerPhone', prePopulatedCustomer.customerPhone || '');
      form.setValue('customerAddress', prePopulatedCustomer.customerAddress || '');
    }
  }, [prePopulatedCustomer, form]);

  // Update form when vehicle is selected
  useEffect(() => {
    if (selectedVehicle) {
      form.setValue('vehicleMake', selectedVehicle.make || '');
      form.setValue('vehicleModel', selectedVehicle.model || '');
      form.setValue('vehicleYear', selectedVehicle.year?.toString() || '');
      form.setValue('licensePlate', selectedVehicle.license_plate || '');
      form.setValue('vin', selectedVehicle.vin || '');
      setShowNewVehicleForm(false);
    }
  }, [selectedVehicle, form]);

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
      form.setValue('customer', fullName);
      form.setValue('customerEmail', customer.email || '');
      form.setValue('customerPhone', customer.phone || '');
      form.setValue('customerAddress', customer.address || '');
    } else {
      form.setValue('customer', '');
      form.setValue('customerEmail', '');
      form.setValue('customerPhone', '');
      form.setValue('customerAddress', '');
    }
    // Clear vehicle selection when customer changes
    setSelectedVehicle(null);
    setShowNewVehicleForm(false);
  };

  const handleVehicleSelect = (vehicle: CustomerVehicle | null) => {
    setSelectedVehicle(vehicle);
  };

  const handleAddNewVehicle = () => {
    setSelectedVehicle(null);
    setShowNewVehicleForm(true);
    // Clear vehicle form fields
    form.setValue('vehicleMake', '');
    form.setValue('vehicleModel', '');
    form.setValue('vehicleYear', '');
    form.setValue('licensePlate', '');
    form.setValue('vin', '');
  };

  return (
    <div className="space-y-6">
      {/* Customer Information Card */}
      <Card className="border-green-100">
        <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-transparent">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-green-600" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <FormLabel>Customer</FormLabel>
            <CustomerSearchInput
              onSelectCustomer={handleCustomerSelect}
              selectedCustomer={selectedCustomer}
              placeholderText="Search for existing customer..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Customer email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Customer phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="customerAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Customer address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Vehicle Information Card */}
      <Card className="border-blue-100">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-transparent">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-blue-600" />
              Vehicle Information
            </div>
            {selectedCustomer && !showNewVehicleForm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNewVehicle}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Vehicle
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {selectedCustomer && !showNewVehicleForm ? (
            <div className="space-y-2">
              <FormLabel>Select Vehicle</FormLabel>
              <VehicleSelect
                customerId={selectedCustomer.id}
                onSelectVehicle={handleVehicleSelect}
                selectedVehicleId={selectedVehicle?.id}
              />
            </div>
          ) : null}

          {(showNewVehicleForm || !selectedCustomer) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input placeholder="Vehicle year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleMake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input placeholder="Vehicle make" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Vehicle model" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input placeholder="License plate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN</FormLabel>
                      <FormControl>
                        <Input placeholder="Vehicle VIN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odometer Reading</FormLabel>
                    <FormControl>
                      <Input placeholder="Current odometer reading" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
