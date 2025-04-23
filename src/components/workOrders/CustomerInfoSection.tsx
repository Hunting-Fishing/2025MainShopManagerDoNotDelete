
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer } from "@/types/customer";
import { Loader2, AlertCircle, WifiOff, UserRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface CustomerInfoSectionProps {
  form: any;
  customers: Customer[];
  isLoading: boolean;
  selectedVehicleId?: string | null;
  preSelectedCustomerId?: string | null;
}

export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({ 
  form, 
  customers, 
  isLoading,
  selectedVehicleId,
  preSelectedCustomerId
}) => {
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  // When a customer is selected or pre-selected, find their name and address
  useEffect(() => {
    const customerId = preSelectedCustomerId || form.getValues().customer;
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomerName(`${customer.first_name} ${customer.last_name}`);
        
        // Build address string from customer data
        const addressParts = [];
        if (customer.address) addressParts.push(customer.address);
        if (customer.city) addressParts.push(customer.city);
        if (customer.state) addressParts.push(customer.state);
        if (customer.postal_code) addressParts.push(customer.postal_code);
        
        setCustomerAddress(addressParts.join(", "));
        
        // If a customer is pre-selected, ensure it's set in the form
        if (preSelectedCustomerId && form.getValues().customer !== preSelectedCustomerId) {
          form.setValue('customer', preSelectedCustomerId);
        }
      }
    }
  }, [form, customers, preSelectedCustomerId]);

  // Add a timeout to detect if customers are taking too long to load
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (isLoading) {
      setError(null);
      timeoutId = window.setTimeout(() => {
        if (isLoading && customers.length === 0) {
          setError("Loading is taking longer than expected. Please try refreshing the page.");
        }
      }, 10000); // 10 seconds timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, customers]);
  
  return (
    <>
      {/* Error alert for timeout or other errors */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Customer Select Field */}
      <FormField
        control={form.control}
        name="customer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer</FormLabel>
            <FormControl>
              {isLoading ? (
                <div className="flex items-center border rounded-md p-2 gap-2 bg-gray-50">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading customers...</span>
                </div>
              ) : customers.length === 0 ? (
                <div>
                  <Select disabled={true} value={field.value || ""}>
                    <SelectTrigger className="border-red-200 bg-red-50">
                      <div className="flex items-center gap-2">
                        <WifiOff className="h-4 w-4 text-red-500" />
                        <span className="text-red-700">Connection issue</span>
                      </div>
                    </SelectTrigger>
                  </Select>
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No customers found. There might be a connection issue or permissions problem.
                    </AlertDescription>
                  </Alert>
                  <div className="mt-2">
                    <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                      Refresh Page
                    </Button>
                  </div>
                </div>
              ) : (
                <Select
                  disabled={isLoading}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Find customer name for the selected ID
                    const customer = customers.find(c => c.id === value);
                    if (customer) {
                      setSelectedCustomerName(`${customer.first_name} ${customer.last_name}`);
                      
                      // Update address
                      const addressParts = [];
                      if (customer.address) addressParts.push(customer.address);
                      if (customer.city) addressParts.push(customer.city);
                      if (customer.state) addressParts.push(customer.state);
                      if (customer.postal_code) addressParts.push(customer.postal_code);
                      
                      setCustomerAddress(addressParts.join(", "));
                    }
                  }}
                  value={field.value || preSelectedCustomerId || ""}
                >
                  <SelectTrigger className="bg-white">
                    {isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Loading customers...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Select a customer" />
                    )}
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {customers.map((customer) => (
                      <SelectItem 
                        key={customer.id} 
                        value={customer.id}
                        className="flex items-center py-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 p-1 rounded-full">
                            <UserRound className="h-3 w-3 text-blue-600" />
                          </div>
                          <span>
                            {customer.first_name} {customer.last_name}
                            {customer.company ? ` (${customer.company})` : ''}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Location Field - Use customer address if available */}
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input 
                placeholder={customerAddress ? "Customer address will be used" : "Service location"} 
                {...field} 
                defaultValue={customerAddress || field.value}
                className="bg-white"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description Field */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-full">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input 
                placeholder="Brief description of the work" 
                {...field} 
                className="bg-white"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Hidden field to track the selected vehicle */}
      {selectedVehicleId && (
        <input type="hidden" id="selected-vehicle-id" value={selectedVehicleId} />
      )}
    </>
  );
};
