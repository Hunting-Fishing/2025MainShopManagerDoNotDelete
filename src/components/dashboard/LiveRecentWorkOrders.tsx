
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface WorkOrder {
  id: string;
  work_order_number?: string;
  status: string;
  created_at: string;
  description?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_id?: string;
}

async function fetchRecentWorkOrders(): Promise<WorkOrder[]> {
  console.log('Fetching recent work orders for dashboard...');
  
  // First, get work orders without embedded relationships
  const { data: workOrdersData, error: workOrdersError } = await supabase
    .from('work_orders')
    .select('id, work_order_number, status, created_at, description, customer_id')
    .order('created_at', { ascending: false })
    .limit(10);

  if (workOrdersError) {
    console.error('Error fetching work orders:', workOrdersError);
    throw workOrdersError;
  }

  console.log('Raw work orders data:', workOrdersData);

  if (!workOrdersData || workOrdersData.length === 0) {
    console.log('No work orders found in database');
    return [];
  }

  // Get unique customer IDs
  const customerIds = [...new Set(workOrdersData
    .map(wo => wo.customer_id)
    .filter(Boolean))];

  // Fetch customer data separately if we have customer IDs
  let customersData: any[] = [];
  if (customerIds.length > 0) {
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, first_name, last_name')
      .in('id', customerIds);

    if (customersError) {
      console.error('Error fetching customers:', customersError);
    } else {
      customersData = customers || [];
    }
  }

  console.log('Customers data:', customersData);

  // Combine work orders with customer data
  const formattedOrders = workOrdersData.map(wo => {
    const customer = customersData.find(c => c.id === wo.customer_id);
    
    const formattedOrder = {
      id: wo.id,
      work_order_number: wo.work_order_number || `WO-${wo.id.slice(0, 8)}`,
      status: wo.status,
      created_at: wo.created_at,
      customer_first_name: customer?.first_name,
      customer_last_name: customer?.last_name,
      description: wo.description,
      customer_id: wo.customer_id,
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
    retry: 2,
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
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
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Error loading recent work orders</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
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
                  <p className="text-xs text-muted-foreground truncate">
                    {workOrder.customer_first_name && workOrder.customer_last_name 
                      ? `${workOrder.customer_first_name} ${workOrder.customer_last_name}`
                      : workOrder.customer_id 
                        ? `Customer ID: ${workOrder.customer_id.slice(0, 8)}`
                        : 'No customer assigned'
                    }
                  </p>
                  {workOrder.description && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {workOrder.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(workOrder.status)}
                  >
                    {workOrder.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(workOrder.created_at).toLocaleDateString()}
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
