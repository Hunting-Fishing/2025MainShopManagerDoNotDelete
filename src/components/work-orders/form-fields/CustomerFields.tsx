
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, User, Car } from "lucide-react";
import { CustomerSelect } from "../customer-select/CustomerSelect";
import { VehicleSelect } from "../customer-select/VehicleSelect";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { Customer, CustomerVehicle } from "@/types/customer";

interface CustomerFieldsProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  prePopulatedCustomer?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
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

  // Handle pre-populated data on component mount
  useEffect(() => {
    if (prePopulatedCustomer) {
      // Set customer information
      if (prePopulatedCustomer.customerName) {
        form.setValue('customer', prePopulatedCustomer.customerName);
      }
      if (prePopulatedCustomer.customerEmail) {
        form.setValue('customerEmail', prePopulatedCustomer.customerEmail);
      }
      if (prePopulatedCustomer.customerPhone) {
        form.setValue('customerPhone', prePopulatedCustomer.customerPhone);
      }
      if (prePopulatedCustomer.customerAddress) {
        form.setValue('customerAddress', prePopulatedCustomer.customerAddress);
      }

      // Set vehicle information
      if (prePopulatedCustomer.vehicleMake) {
        form.setValue('vehicleMake', prePopulatedCustomer.vehicleMake);
      }
      if (prePopulatedCustomer.vehicleModel) {
        form.setValue('vehicleModel', prePopulatedCustomer.vehicleModel);
      }
      if (prePopulatedCustomer.vehicleYear) {
        form.setValue('vehicleYear', prePopulatedCustomer.vehicleYear);
      }
      if (prePopulatedCustomer.vehicleLicensePlate) {
        form.setValue('licensePlate', prePopulatedCustomer.vehicleLicensePlate);
      }
      if (prePopulatedCustomer.vehicleVin) {
        form.setValue('vin', prePopulatedCustomer.vehicleVin);
      }
    }
  }, [prePopulatedCustomer, form]);

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setSelectedVehicle(null); // Reset vehicle selection when customer changes
    
    if (customer) {
      form.setValue('customer', `${customer.first_name} ${customer.last_name}`.trim());
      form.setValue('customerEmail', customer.email || '');
      form.setValue('customerPhone', customer.phone || '');
      form.setValue('customerAddress', customer.address || '');
    } else {
      form.setValue('customer', '');
      form.setValue('customerEmail', '');
      form.setValue('customerPhone', '');
      form.setValue('customerAddress', '');
    }
    
    // Clear vehicle fields when customer changes
    form.setValue('vehicleMake', '');
    form.setValue('vehicleModel', '');
    form.setValue('vehicleYear', '');
    form.setValue('licensePlate', '');
    form.setValue('vin', '');
    form.setValue('odometer', '');
  };

  const handleVehicleSelect = (vehicle: CustomerVehicle | null) => {
    setSelectedVehicle(vehicle);
    setShowNewVehicleForm(false);
    
    if (vehicle) {
      form.setValue('vehicleMake', vehicle.make || '');
      form.setValue('vehicleModel', vehicle.model || '');
      form.setValue('vehicleYear', vehicle.year?.toString() || '');
      form.setValue('licensePlate', vehicle.license_plate || '');
      form.setValue('vin', vehicle.vin || '');
    } else {
      form.setValue('vehicleMake', '');
      form.setValue('vehicleModel', '');
      form.setValue('vehicleYear', '');
      form.setValue('licensePlate', '');
      form.setValue('vin', '');
    }
  };

  const handleAddNewVehicle = () => {
    setSelectedVehicle(null);
    setShowNewVehicleForm(true);
    // Clear vehicle fields for new entry
    form.setValue('vehicleMake', '');
    form.setValue('vehicleModel', '');
    form.setValue('vehicleYear', '');
    form.setValue('licensePlate', '');
    form.setValue('vin', '');
    form.setValue('odometer', '');
  };

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Customer</label>
              <CustomerSelect
                onSelectCustomer={handleCustomerSelect}
                selectedCustomerId={selectedCustomer?.id}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" type="email" {...field} />
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
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Select Vehicle</label>
                  <VehicleSelect
                    customerId={selectedCustomer.id}
                    onSelectVehicle={handleVehicleSelect}
                    selectedVehicleId={selectedVehicle?.id}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewVehicle}
                  className="mt-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Vehicle
                </Button>
              </div>
            </div>
          )}

          {(showNewVehicleForm || !selectedCustomer || selectedVehicle || prePopulatedCustomer) && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleMake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter vehicle make" {...field} />
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
                        <Input placeholder="Enter vehicle model" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter vehicle year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter license plate" {...field} />
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
                        <Input placeholder="Enter VIN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="odometer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odometer</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter odometer reading" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
