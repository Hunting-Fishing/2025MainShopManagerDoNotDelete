import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/stores/cartStore';
import { createOrder } from '@/services/orderService';
import { CheckoutForm } from './CheckoutForm';
import { OrderSummary } from './OrderSummary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const CheckoutPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState({
    shipping_method: 'standard',
    notes: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCartStore();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/shopping');
    }
  }, [items, navigate]);

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);

      // Create order items from cart
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      // Create order
      const order = await createOrder({
        items: orderItems,
        shipping_method: orderData.shipping_method,
        notes: orderData.notes
      });

      // Clear cart
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id.slice(0, 8)} has been created.`
      });

      // Navigate to order confirmation  
      navigate(`/orders/${order.id}`);

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error placing order",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <CheckoutForm 
              orderData={orderData}
              onUpdate={setOrderData}
            />
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <OrderSummary items={items} />
            
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total: ${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <Button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};