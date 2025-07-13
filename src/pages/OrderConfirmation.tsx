import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    product: {
      title: string;
      image_url?: string;
    };
  }[];
}

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID not provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            order_items (
              id,
              quantity,
              unit_price,
              product:products (
                title,
                image_url
              )
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'This order could not be found.'}</p>
          <Button onClick={() => navigate('/shopping')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Order Number:</span>
              <span>#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Order Date:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  {item.product.image_url && (
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/shopping')}
            className="flex-1"
          >
            Continue Shopping
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/profile')}
            className="flex-1"
          >
            View Orders
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">What's Next?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• You'll receive an email confirmation shortly</li>
            <li>• Your order will be processed within 1-2 business days</li>
            <li>• You'll get tracking information once your order ships</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;