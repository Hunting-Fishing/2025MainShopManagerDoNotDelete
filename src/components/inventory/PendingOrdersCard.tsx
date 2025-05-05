
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryOrders } from "@/hooks/inventory/useInventoryOrders";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export function PendingOrdersCard() {
  const { orders, loadOrders, loading } = useInventoryOrders();
  
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);
  
  // Only show active orders (ordered or partially received)
  const activeOrders = orders.filter(order => 
    order.status === "ordered" || order.status === "partially received"
  );
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Pending Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading pending orders...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (activeOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Pending Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No pending orders found.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Pending Orders ({activeOrders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ul className="space-y-2">
            {activeOrders.slice(0, 3).map(order => (
              <li key={order.id} className="text-sm">
                <span className="font-medium">{order.item_name}</span>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Qty: {order.quantity_ordered}</span>
                  <span>Expected: {format(new Date(order.expected_arrival), "MMM d")}</span>
                </div>
              </li>
            ))}
            {activeOrders.length > 3 && (
              <li className="text-sm text-gray-500">
                + {activeOrders.length - 3} more pending orders
              </li>
            )}
          </ul>
          
          <Link to="/inventory/orders" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
            View all orders
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
