import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentFormProps {
  orderId: string;
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  amount,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create payment intent
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
        body: {
          orderId,
          amount,
          currency: 'usd'
        }
      });

      if (paymentError) throw paymentError;

      // In a real implementation, you would integrate with Stripe Elements here
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirm payment
      const { data: confirmData, error: confirmError } = await supabase.functions.invoke('confirm-payment', {
        body: {
          payment_intent_id: paymentData.payment_intent_id
        }
      });

      if (confirmError) throw confirmError;

      toast({
        title: "Payment successful!",
        description: "Your order has been processed.",
      });

      onPaymentSuccess(paymentData.payment_intent_id);

    } catch (error: any) {
      const errorMessage = error.message || 'Payment failed';
      toast({
        title: "Payment failed",
        description: errorMessage,
        variant: "destructive"
      });
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Order Total</p>
          <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-1">Demo Payment</p>
          <p className="text-xs text-blue-600">
            This is a demo implementation. In production, this would integrate with Stripe Elements 
            for secure card processing.
          </p>
        </div>

        <Button 
          onClick={handlePayment} 
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By clicking "Pay", you agree to our terms of service and privacy policy.
        </p>
      </CardContent>
    </Card>
  );
};