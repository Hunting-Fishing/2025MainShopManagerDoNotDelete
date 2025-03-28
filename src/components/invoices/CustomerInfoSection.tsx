
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CustomerInfoSectionProps {
  customer: string;
  customerAddress: string;
  customerEmail: string;
  onCustomerChange: (value: string) => void;
  onCustomerAddressChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
}

export function CustomerInfoSection({
  customer,
  customerAddress,
  customerEmail,
  onCustomerChange,
  onCustomerAddressChange,
  onCustomerEmailChange,
}: CustomerInfoSectionProps) {
  return (
    <>
      <h3 className="font-medium mb-3">Customer Information</h3>
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <Label htmlFor="customer">Customer Name</Label>
          <Input 
            id="customer" 
            value={customer}
            onChange={(e) => onCustomerChange(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>
        <div>
          <Label htmlFor="customer-address">Customer Address</Label>
          <Textarea 
            id="customer-address" 
            value={customerAddress}
            onChange={(e) => onCustomerAddressChange(e.target.value)}
            placeholder="Enter customer address"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="customer-email">Customer Email</Label>
          <Input 
            id="customer-email" 
            type="email"
            value={customerEmail}
            onChange={(e) => onCustomerEmailChange(e.target.value)}
            placeholder="customer@example.com"
          />
        </div>
      </div>
    </>
  );
}
