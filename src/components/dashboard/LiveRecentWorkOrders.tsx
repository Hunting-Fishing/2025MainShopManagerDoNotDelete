
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface WorkOrder {
  id: string;
  work_order_number: string;
  status: string;
  created_at: string;
  customer_first_name?: string;
  customer_last_name?: string;
  description?: string;
}

async function fetchRecentWorkOrders(): Promise<WorkOrder[]> {
  console.log('Fetching recent work orders for dashboard...');
  
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      id,
      work_order_number,
      status,
      created_at,
      description,
      customers (
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching recent work orders:', error);
    throw error;
  }

  console.log('Raw work orders data:', data);

  if (!data || data.length === 0) {
    console.log('No work orders found in database');
    return [];
  }

  const formattedOrders = data.map(wo => {
    // Handle customers data - it could be null, an array, or an object
    const customerData = Array.isArray(wo.customers) ? wo.customers[0] : wo.customers;
    
    const formattedOrder = {
      id: wo.id,
      work_order_number: wo.work_order_number || `WO-${wo.id.slice(0, 8)}`,
      status: wo.status,
      created_at: wo.created_at,
      customer_first_name: customerData?.first_name,
      customer_last_name: customerData?.last_name,
      description: wo.description,
    };
    
    console.log('Formatted work order:', formattedOrder);
    return formattedOrder;
  });

  console.log('Final formatted work orders:', formattedOrders);
  return formattedOrders;
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
    case 'in progress':
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function LiveRecentWorkOrders() {
  const { data: workOrders = [], isLoading, error } = useQuery({
    queryKey: ['recent-work-orders'],
    queryFn: fetchRecentWorkOrders,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  console.log('LiveRecentWorkOrders render - workOrders:', workOrders, 'isLoading:', isLoading, 'error:', error);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error in LiveRecentWorkOrders:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading recent work orders: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {workOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No work orders found</p>
            <p className="text-sm text-muted-foreground">Start by creating your first work order to track service jobs.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workOrders.map((workOrder) => (
              <div key={workOrder.id} className="flex items-center justify-between space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {workOrder.work_order_number}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {workOrder.customer_first_name && workOrder.customer_last_name
                      ? `${workOrder.customer_first_name} ${workOrder.customer_last_name}`
                      : 'No customer assigned'
                    }
                  </p>
                  {workOrder.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {workOrder.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(workOrder.status)}>
                    {workOrder.status?.replace('_', ' ') || 'Unknown'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(workOrder.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
