
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerFormValues } from "../schemas/customerSchema";
import { CreditCard } from "lucide-react";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { 
  HelpCircle, 
  FileText,
  BadgeDollarSign
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Payment method constants
const paymentMethods = [
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "venmo", label: "Venmo" },
  { value: "apple_pay", label: "Apple Pay" },
  { value: "google_pay", label: "Google Pay" },
  { value: "other", label: "Other" }
];

interface PaymentBillingFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const PaymentBillingFields: React.FC<PaymentBillingFieldsProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Payment & Billing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preferred Payment Method */}
        <FormField
          control={form.control}
          name="preferred_payment_method"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Preferred Payment Method</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Customer's preferred way to pay for services</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Auto-Billing Option */}
        <FormField
          control={form.control}
          name="auto_billing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <FormLabel>Auto-Billing</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Automatically charge the customer's payment method for services</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormDescription>
                  Customer agrees to automatic payments for services
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Credit Terms */}
        <FormField
          control={form.control}
          name="credit_terms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Credit Terms</FormLabel>
                <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select credit terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="immediate">Immediate Payment</SelectItem>
                  <SelectItem value="net15">Net 15</SelectItem>
                  <SelectItem value="net30">Net 30</SelectItem>
                  <SelectItem value="net60">Net 60</SelectItem>
                  <SelectItem value="custom">Custom Terms</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Payment terms for invoices
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* T&C Agreement */}
        <FormField
          control={form.control}
          name="terms_agreed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <FormLabel>Terms & Conditions</FormLabel>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <FormDescription>
                  Customer has agreed to our terms and conditions
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
