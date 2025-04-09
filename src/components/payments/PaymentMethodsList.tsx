
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Bank, 
  Banknote, 
  CheckCircle, 
  Trash2, 
  Star, 
  PlusCircle 
} from "lucide-react";
import { PaymentMethod, paymentMethodOptions } from '@/types/payment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentMethodForm } from './PaymentMethodForm';

interface PaymentMethodsListProps {
  customerId: string;
}

export function PaymentMethodsList({ customerId }: PaymentMethodsListProps) {
  const { 
    paymentMethods, 
    isLoading, 
    error,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod
  } = usePaymentMethods(customerId);
  
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  
  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5 mr-2" />;
      case 'bank_transfer':
        return <Bank className="h-5 w-5 mr-2" />;
      case 'cash':
        return <Banknote className="h-5 w-5 mr-2" />;
      case 'check':
        return <CheckCircle className="h-5 w-5 mr-2" />;
      default:
        return <CreditCard className="h-5 w-5 mr-2" />;
    }
  };

  const getPaymentMethodLabel = (type: string) => {
    const option = paymentMethodOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };
  
  const handleAddPaymentMethod = async (data: Omit<PaymentMethod, 'id' | 'customer_id' | 'created_at' | 'updated_at'>) => {
    const result = await addPaymentMethod(data);
    if (result) {
      setShowAddDialog(false);
    }
    return !!result;
  };
  
  const handleRemove = async (id: string) => {
    if (confirm("Are you sure you want to remove this payment method?")) {
      await deletePaymentMethod(id);
    }
  };
  
  const handleSetDefault = async (id: string) => {
    await setDefaultPaymentMethod(id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Loading your payment methods...</CardDescription>
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
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Unable to load payment methods</CardDescription>
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
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Fill out the form below to add a new payment method.
              </DialogDescription>
            </DialogHeader>
            <PaymentMethodForm onSubmit={handleAddPaymentMethod} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No payment methods found.</p>
            <p className="text-sm mt-1">Add a payment method to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div 
                key={method.id} 
                className={`border p-4 rounded-md ${method.is_default ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getPaymentMethodIcon(method.method_type)}
                    <div>
                      <p className="font-medium">
                        {getPaymentMethodLabel(method.method_type)}
                        {method.is_default && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </p>
                      {method.card_brand && method.card_last_four && (
                        <p className="text-sm text-muted-foreground">
                          {method.card_brand} •••• {method.card_last_four}
                          {method.expiry_month && method.expiry_year && (
                            <span> (Expires: {method.expiry_month}/{method.expiry_year})</span>
                          )}
                        </p>
                      )}
                      {method.billing_name && (
                        <p className="text-sm text-muted-foreground">
                          {method.billing_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!method.is_default && (
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={() => handleSetDefault(method.id)}
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleRemove(method.id)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
