import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthUser } from '@/hooks/useAuthUser';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  DollarSign,
  Truck
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  shippingAddress: string;
  trackingNumber?: string;
}

// Mock data - replace with actual API call
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 299.99,
    items: [
      { id: '1', name: 'Premium Oil Filter', quantity: 2, price: 24.99 },
      { id: '2', name: 'Brake Pads Set', quantity: 1, price: 149.99 },
      { id: '3', name: 'Air Filter', quantity: 1, price: 49.99 }
    ],
    shippingAddress: '123 Main St, Anytown, USA 12345',
    trackingNumber: 'TRK123456789'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'shipped',
    total: 89.99,
    items: [
      { id: '4', name: 'Engine Oil 5W-30', quantity: 3, price: 29.99 }
    ],
    shippingAddress: '123 Main St, Anytown, USA 12345',
    trackingNumber: 'TRK987654321'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: '2024-01-25',
    status: 'processing',
    total: 199.99,
    items: [
      { id: '5', name: 'Spark Plugs Set', quantity: 1, price: 79.99 },
      { id: '6', name: 'Cabin Air Filter', quantity: 2, price: 39.99 }
    ],
    shippingAddress: '123 Main St, Anytown, USA 12345'
  }
];

export default function UserOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders] = useState<Order[]>(mockOrders);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrderSummary = () => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const processing = orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    return { total, delivered, processing, totalSpent };
  };

  const summary = getOrderSummary();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Orders
        </Button>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{summary.delivered}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{summary.processing}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">${summary.totalSpent.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders or items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Ordered on {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(order.status)} className="mb-2">
                    {order.status.toUpperCase()}
                  </Badge>
                  <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium mb-1">Shipping Address</h4>
                    <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <h4 className="font-medium mb-1">Tracking Number</h4>
                      <p className="text-sm text-gray-600 font-mono">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  {order.trackingNumber && (
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Track Package
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You haven\'t placed any orders yet'
                }
              </p>
              <Button>Start Shopping</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}