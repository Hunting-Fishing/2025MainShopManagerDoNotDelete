
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Search, Plus } from "lucide-react";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { CustomerSelect } from "../customer-select/CustomerSelect";
import { VehicleSelect } from "../customer-select/VehicleSelect";
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
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Auto-populate from URL parameters on component mount
  useEffect(() => {
    if (prePopulatedCustomer?.customerName) {
      // If we have pre-populated data, set it as manual entry initially
      setIsManualEntry(true);
      setShowCustomerSearch(false);
      
      // Set form values
      form.setValue('customer', prePopulatedCustomer.customerName);
      if (prePopulatedCustomer.customerEmail) {
        form.setValue('customerEmail', prePopulatedCustomer.customerEmail);
      }
      if (prePopulatedCustomer.customerPhone) {
        form.setValue('customerPhone', prePopulatedCustomer.customerPhone);
      }
      if (prePopulatedCustomer.customerAddress) {
        form.setValue('customerAddress', prePopulatedCustomer.customerAddress);
      }

      // Set vehicle info if available
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
    if (customer) {
      form.setValue('customer', `${customer.first_name} ${customer.last_name}`.trim());
      form.setValue('customerEmail', customer.email || '');
      form.setValue('customerPhone', customer.phone || '');
      form.setValue('customerAddress', customer.address || '');
      setIsManualEntry(false);
    }
  };

  const handleVehicleSelect = (vehicle: CustomerVehicle | null) => {
    setSelectedVehicle(vehicle);
    if (vehicle) {
      form.setValue('vehicleMake', vehicle.make || '');
      form.setValue('vehicleModel', vehicle.model || '');
      form.setValue('vehicleYear', vehicle.year?.toString() || '');
      form.setValue('licensePlate', vehicle.license_plate || '');
      form.setValue('vin', vehicle.vin || '');
    }
  };

  const handleSearchCustomer = () => {
    setShowCustomerSearch(true);
    setIsManualEntry(false);
  };

  const handleManualEntry = () => {
    setIsManualEntry(true);
    setShowCustomerSearch(false);
    setSelectedCustomer(null);
    setSelectedVehicle(null);
  };

  return (
    <Card className="mb-4 border-green-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-transparent">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-green-600" />
            Customer & Vehicle Information
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSearchCustomer}
              className="flex items-center gap-1"
            >
              <Search className="h-4 w-4" />
              Search Customer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualEntry}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Manual Entry
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Customer Selection */}
        {showCustomerSearch && !isManualEntry && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Customer</label>
              <CustomerSelect
                onSelectCustomer={handleCustomerSelect}
                selectedCustomerId={selectedCustomer?.id}
              />
            </div>
            
            {selectedCustomer && (
              <div>
                <label className="text-sm font-medium">Select Vehicle</label>
                <VehicleSelect
                  customerId={selectedCustomer.id}
                  onSelectVehicle={handleVehicleSelect}
                  selectedVehicleId={selectedVehicle?.id}
                />
              </div>
            )}
          </div>
        )}

        {/* Manual Customer Entry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter customer name" 
                    {...field}
                    readOnly={showCustomerSearch && selectedCustomer && !isManualEntry}
                  />
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
                  <Input 
                    type="email" 
                    placeholder="Enter customer email" 
                    {...field}
                    readOnly={showCustomerSearch && selectedCustomer && !isManualEntry}
                  />
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
                  <Input 
                    placeholder="Enter customer phone" 
                    {...field}
                    readOnly={showCustomerSearch && selectedCustomer && !isManualEntry}
                  />
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
                  <Input 
                    placeholder="Enter customer address" 
                    {...field}
                    readOnly={showCustomerSearch && selectedCustomer && !isManualEntry}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Vehicle Information */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium mb-3">Vehicle Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="vehicleMake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Vehicle make" 
                      {...field}
                      readOnly={showCustomerSearch && selectedVehicle && !isManualEntry}
                    />
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
                    <Input 
                      placeholder="Vehicle model" 
                      {...field}
                      readOnly={showCustomerSearch && selectedVehicle && !isManualEntry}
                    />
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
                    <Input 
                      placeholder="Vehicle year" 
                      {...field}
                      readOnly={showCustomerSearch && selectedVehicle && !isManualEntry}
                    />
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
                    <Input 
                      placeholder="License plate" 
                      {...field}
                      readOnly={showCustomerSearch && selectedVehicle && !isManualEntry}
                    />
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
                    <Input 
                      placeholder="Vehicle VIN" 
                      {...field}
                      readOnly={showCustomerSearch && selectedVehicle && !isManualEntry}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
