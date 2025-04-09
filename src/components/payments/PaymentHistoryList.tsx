
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { PaymentForm } from './PaymentForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Receipt } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { paymentStatusOptions, paymentTypeOptions } from '@/types/payment';

interface PaymentHistoryListProps {
  customerId: string;
  invoiceId?: string;
  allowAddPayment?: boolean;
}

export function PaymentHistoryList({ 
  customerId, 
  invoiceId,
  allowAddPayment = true 
}: PaymentHistoryListProps) {
  const {
    payments,
    isLoading,
    error,
    totalPayments,
    addPayment
  } = usePaymentHistory(customerId, invoiceId);

  const [showAddDialog, setShowAddDialog] = React.useState(false);

  const getStatusLabel = (status: string) => {
    const option = paymentStatusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const option = paymentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const handleAddPayment = async (values: any) => {
    const result = await addPayment(values);
    if (result) {
      setShowAddDialog(false);
    }
    return !!result;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Loading payment history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Unable to load payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p>{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            {payments.length} payment{payments.length !== 1 ? 's' : ''} • Total: ${totalPayments.toFixed(2)}
          </CardDescription>
        </div>
        {allowAddPayment && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Fill out the form below to record a new payment.
                </DialogDescription>
              </DialogHeader>
              <PaymentForm 
                customerId={customerId} 
                invoiceId={invoiceId} 
                onSubmit={handleAddPayment} 
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>No payment history found.</p>
            {allowAddPayment && (
              <p className="text-sm mt-1">Record a payment to get started.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.transaction_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{getTypeLabel(payment.payment_type)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusClass(payment.status)} variant="outline">
                      {getStatusLabel(payment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.payment_methods ? (
                      <>
                        {payment.payment_methods.method_type === 'credit_card' && payment.payment_methods.card_brand && (
                          <>{payment.payment_methods.card_brand} •••• {payment.payment_methods.card_last_four}</>
                        )}
                        {payment.payment_methods.method_type !== 'credit_card' && (
                          <>{payment.payment_methods.method_type}</>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
