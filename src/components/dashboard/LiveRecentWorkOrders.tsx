
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Clock, User, Calendar, Wrench, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface WorkOrderData {
  id: string;
  description: string;
  status: string;
  service_type: string;
  created_at: string;
  work_order_number: string;
  customer_id: string;
  customer_name?: string;
}

interface CustomerData {
  id: string;
  first_name: string;
  last_name: string;
}

export function LiveRecentWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchRecentWorkOrders = async () => {
    try {
      console.log('Fetching recent work orders...');
      setError(null);

      // Fetch work orders
      const { data: workOrdersData, error: workOrdersError } = await supabase
        .from('work_orders')
        .select(`
          id,
          description,
          status,
          service_type,
          created_at,
          work_order_number,
          customer_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (workOrdersError) {
        console.error('Error fetching work orders:', workOrdersError);
        throw workOrdersError;
      }

      console.log('Fetched work orders:', workOrdersData);

      if (!workOrdersData || workOrdersData.length === 0) {
        console.log('No work orders found');
        setWorkOrders([]);
        setIsLoading(false);
        return;
      }

      // Get unique customer IDs
      const customerIds = [...new Set(workOrdersData
        .map(wo => wo.customer_id)
        .filter(Boolean)
      )];

      let customersData: CustomerData[] = [];
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

      // Combine work orders with customer data
      const combinedData = workOrdersData.map(workOrder => {
        const customer = customersData.find(c => c.id === workOrder.customer_id);
        return {
          ...workOrder,
          customer_name: customer 
            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() 
            : 'Unknown Customer'
        };
      });

      console.log('Combined work orders data:', combinedData);
      setWorkOrders(combinedData);
      setLastRefresh(new Date());

    } catch (error: any) {
      console.error('Error in fetchRecentWorkOrders:', error);
      setError(error.message || 'Failed to fetch work orders');
      toast({
        title: "Error",
        description: "Failed to load recent work orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentWorkOrders();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRecentWorkOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in-progress':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || 'Unknown';
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchRecentWorkOrders();
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Failed to load work orders</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
        <div className="text-sm text-gray-600 bg-red-50 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (workOrders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Wrench className="h-5 w-5" />
            <span className="font-medium">Recent Work Orders</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No work orders yet</h3>
          <p className="text-sm">Work orders will appear here once created.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <Wrench className="h-5 w-5" />
          <span className="font-medium">Recent Work Orders</span>
          <span className="text-xs text-gray-500">
            ({workOrders.length} orders)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {workOrders.map((order) => (
          <div
            key={order.id}
            className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {order.work_order_number ? `#${order.work_order_number}` : `#${order.id.slice(0, 8)}`}
                  </h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {order.description || order.service_type || 'No description available'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                onClick={() => window.open(`/work-orders/${order.id}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="truncate max-w-32">
                    {order.customer_name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {order.service_type && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {order.service_type}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="pt-4 border-t border-gray-100">
        <Button 
          variant="outline" 
          className="w-full gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={() => window.open('/work-orders', '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          View All Work Orders
        </Button>
      </div>
    </div>
  );
}
