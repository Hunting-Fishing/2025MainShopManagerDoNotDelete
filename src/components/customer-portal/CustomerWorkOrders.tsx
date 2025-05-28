
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Clock } from 'lucide-react';

interface WorkOrder {
  id: string;
  status: string;
  description: string;
  created_at: string;
  total_cost: number;
  service_type: string;
}

export function CustomerWorkOrders() {
  const { userId } = useAuthUser();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkOrders() {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .eq('customer_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching work orders:', error);
        } else {
          setWorkOrders(data || []);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWorkOrders();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Orders</CardTitle>
        <CardDescription>View your service history and current work orders</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : workOrders.length > 0 ? (
          <div className="space-y-4">
            {workOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Work Order #{order.id.slice(-8)}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{order.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      {order.service_type && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {order.service_type}
                        </div>
                      )}
                      {order.total_cost && (
                        <div className="font-medium text-gray-900">
                          ${order.total_cost.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Orders</h3>
            <p className="text-gray-500">You don't have any work orders yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
