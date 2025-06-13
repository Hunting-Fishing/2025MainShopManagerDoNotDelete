
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Car, Plus, Settings } from "lucide-react";
import { CustomerSelect } from "../customer-select/CustomerSelect";
import { VehicleSelect } from "../customer-select/VehicleSelect";
import { Customer, CustomerVehicle } from "@/types/customer";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

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
  const [showManualVehicleEntry, setShowManualVehicleEntry] = useState(false);
  const [isInCustomerContext, setIsInCustomerContext] = useState(false);

  // Check if we're in a customer context based on URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('customerId');
    const customerName = urlParams.get('customerName');
    
    if (customerId && customerName) {
      setIsInCustomerContext(true);
      // Set the customer information from URL
      form.setValue('customer', decodeURIComponent(customerName));
      if (prePopulatedCustomer?.customerEmail) {
        form.setValue('customerEmail', prePopulatedCustomer.customerEmail);
      }
      if (prePopulatedCustomer?.customerPhone) {
        form.setValue('customerPhone', prePopulatedCustomer.customerPhone);
      }
      if (prePopulatedCustomer?.customerAddress) {
        form.setValue('customerAddress', prePopulatedCustomer.customerAddress);
      }
      
      // Create a mock customer object for vehicle selection
      setSelectedCustomer({
        id: customerId,
        first_name: decodeURIComponent(customerName).split(' ')[0] || '',
        last_name: decodeURIComponent(customerName).split(' ').slice(1).join(' ') || '',
        email: prePopulatedCustomer?.customerEmail || '',
        phone: prePopulatedCustomer?.customerPhone || '',
        address: prePopulatedCustomer?.customerAddress || ''
      } as Customer);
    } else {
      setIsInCustomerContext(false);
    }
  }, [prePopulatedCustomer, form]);

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: CustomerVehicle | null) => {
    setSelectedVehicle(vehicle);
    if (vehicle) {
      form.setValue('vehicleMake', vehicle.make || '');
      form.setValue('vehicleModel', vehicle.model || '');
      form.setValue('vehicleYear', vehicle.year?.toString() || '');
      form.setValue('licensePlate', vehicle.license_plate || '');
      form.setValue('vin', vehicle.vin || '');
      setShowManualVehicleEntry(false);
    }
  };

  // Handle customer selection (for non-customer context)
  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setSelectedVehicle(null);
    
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
  };

  const toggleManualEntry = () => {
    setShowManualVehicleEntry(!showManualVehicleEntry);
    if (!showManualVehicleEntry) {
      // Clear existing vehicle selection when switching to manual
      setSelectedVehicle(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Customer Information Card */}
      <Card className="border-green-100">
        <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-transparent">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-green-600" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {!isInCustomerContext ? (
            // Show customer selection when not in customer context
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Customer</label>
                <CustomerSelect
                  onSelectCustomer={handleCustomerSelect}
                  selectedCustomerId={selectedCustomer?.id}
                />
              </div>
              
              {selectedCustomer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <p className="text-sm">{selectedCustomer.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <p className="text-sm">{selectedCustomer.phone || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600">Address</label>
                    <p className="text-sm">{selectedCustomer.address || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Show customer info when in customer context
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-green-900">Selected Customer</h3>
                <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Auto-selected
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Name: </span>
                  <span>{form.watch('customer')}</span>
                </div>
                {form.watch('customerEmail') && (
                  <div>
                    <span className="font-medium">Email: </span>
                    <span>{form.watch('customerEmail')}</span>
                  </div>
                )}
                {form.watch('customerPhone') && (
                  <div>
                    <span className="font-medium">Phone: </span>
                    <span>{form.watch('customerPhone')}</span>
                  </div>
                )}
                {form.watch('customerAddress') && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Address: </span>
                    <span>{form.watch('customerAddress')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Information Card */}
      {selectedCustomer && (
        <Card className="border-blue-100">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <Car className="h-5 w-5 mr-2 text-blue-600" />
                Vehicle Information
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleManualEntry}
                className="flex items-center gap-2"
              >
                {showManualVehicleEntry ? (
                  <>
                    <Car className="h-4 w-4" />
                    Select Existing
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add New Vehicle
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {!showManualVehicleEntry ? (
              // Vehicle Selection Mode
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Vehicle</label>
                  <VehicleSelect
                    customerId={selectedCustomer.id}
                    onSelectVehicle={handleVehicleSelect}
                    selectedVehicleId={selectedVehicle?.id}
                  />
                </div>
                
                {selectedVehicle && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Selected Vehicle Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Year:</span> {selectedVehicle.year || 'N/A'}</div>
                      <div><span className="font-medium">Make:</span> {selectedVehicle.make || 'N/A'}</div>
                      <div><span className="font-medium">Model:</span> {selectedVehicle.model || 'N/A'}</div>
                      <div><span className="font-medium">License:</span> {selectedVehicle.license_plate || 'N/A'}</div>
                      {selectedVehicle.vin && (
                        <div className="col-span-2"><span className="font-medium">VIN:</span> {selectedVehicle.vin}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Manual Entry Mode
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                  <Settings className="h-4 w-4" />
                  <span>Adding new vehicle for this customer</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2023" {...field} />
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
                          <Input placeholder="e.g., Toyota" {...field} />
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
                          <Input placeholder="e.g., Camry" {...field} />
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
                          <Input placeholder="e.g., ABC123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>VIN (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="17-character VIN" {...field} />
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
      )}

      {/* Hidden form fields for customer info when in customer context */}
      {isInCustomerContext && (
        <div className="hidden">
          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerAddress"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
