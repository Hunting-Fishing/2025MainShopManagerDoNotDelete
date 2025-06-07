import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Button } from '@/components/ui/button';
import { useInvoice } from '@/hooks/useInvoice';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/utils';

interface InvoiceDetailsPaymentInfoProps {
  invoiceId: string;
  customerId: string;
}

export function InvoiceDetailsPaymentInfo({ invoiceId, customerId }: InvoiceDetailsPaymentInfoProps) {
  const { invoice, setInvoice } = useInvoice();
  const { invoices, refetch: refetchInvoices } = useInvoices();
  const { payments, isLoading, error, totalPayments, addPayment, refetch } = usePaymentHistory(customerId, invoiceId);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (invoices && invoiceId) {
      const currentInvoice = invoices.find((inv) => inv.id === invoiceId);
      if (currentInvoice) {
        setInvoice(currentInvoice);
      }
    }
  }, [invoices, invoiceId, setInvoice]);

  const remainingBalance = invoice ? invoice.total - totalPayments : 0;

  const handlePaymentSuccess = async () => {
    setShowPaymentForm(false);
    await refetch();
    await refetchInvoices();
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Total Payments:</p>
            <p>{formatCurrency(totalPayments)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Remaining Balance:</p>
            <p>{formatCurrency(remainingBalance)}</p>
          </div>
        </div>
        <div>
          <Button onClick={() => setShowPaymentForm(true)}>Record Payment</Button>
        </div>

        {showPaymentForm && (
          <PaymentForm
            invoiceId={invoiceId}
            customerId={customerId}
            onPaymentSuccess={handlePaymentSuccess}
            onClose={() => setShowPaymentForm(false)}
            remainingBalance={remainingBalance}
          />
        )}

        <div>
          <h3 className="text-md font-semibold">Payment History</h3>
          {isLoading ? (
            <p>Loading payment history...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.payment_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No payment history found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

