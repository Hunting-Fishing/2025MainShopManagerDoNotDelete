import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/shopping/useCart';
import { createOrder } from '@/services/orderService';
import { AddressForm } from '@/components/checkout/AddressForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderSummary } from './OrderSummary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';

export const CheckoutPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [orderData, setOrderData] = useState({
    shipping_method: 'standard',
    notes: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/shopping');
    }
  }, [items, navigate]);

  const handleAddressSubmit = (address: any) => {
    setShippingAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setIsProcessing(true);

      // Create order items from cart
      const orderItems = items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price
      }));

      // Create order with payment info
      const order = await createOrder({
        items: orderItems,
        shipping_address_id: shippingAddress?.id,
        payment_intent_id: paymentIntentId,
        shipping_method: orderData.shipping_method,
        notes: orderData.notes
      });

      // Clear cart
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: `Your order has been confirmed and payment processed.`
      });

      // Navigate to order confirmation  
      navigate(`/order-confirmation/${order.id}`);

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error creating order",
        description: "Payment succeeded but order creation failed. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment failed",
      description: error,
      variant: "destructive"
    });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center ${currentStep === 'address' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === 'address' ? 'border-primary bg-primary text-primary-foreground' : 
              shippingAddress ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'
            }`}>
              1
            </div>
            <span className="ml-2">Shipping Address</span>
          </div>
          <div className="flex-1 h-px bg-border mx-4" />
          <div className={`flex items-center ${currentStep === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === 'payment' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'
            }`}>
              2
            </div>
            <span className="ml-2">Payment</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {currentStep === 'address' && (
              <AddressForm 
                onSubmit={handleAddressSubmit}
                onCancel={() => navigate('/shopping')}
              />
            )}
            
            {currentStep === 'payment' && (
              <div className="space-y-6">
                {/* Address Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Shipping Address
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentStep('address')}
                      >
                        Edit
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shippingAddress && (
                      <div className="text-sm">
                        <p className="font-medium">{shippingAddress.full_name}</p>
                        <p>{shippingAddress.address_line1}</p>
                        {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
                        <p>{shippingAddress.country}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <PaymentForm
                  orderId="temp-order-id"
                  amount={totalPrice}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <OrderSummary items={items} />
          </div>
        </div>
      </div>
    </div>
  );
};