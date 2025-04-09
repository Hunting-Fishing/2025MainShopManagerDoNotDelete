
import React from 'react';
import { PaymentMethodsList } from '@/components/payments/PaymentMethodsList';
import { PaymentHistoryList } from '@/components/payments/PaymentHistoryList';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/types/customer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CustomerPaymentTabProps {
  customer: Customer;
}

export function CustomerPaymentTab({ customer }: CustomerPaymentTabProps) {
  const { toast } = useToast();
  
  // Handle errors for when customer id is not available
  if (!customer.id) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Invalid Customer</AlertTitle>
        <AlertDescription>
          Customer ID is missing. Please reload the page or try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-8">
      <PaymentMethodsList customerId={customer.id} />
      <PaymentHistoryList customerId={customer.id} />
    </div>
  );
}
