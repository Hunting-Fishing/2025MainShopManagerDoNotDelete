
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WorkOrder {
  id: string;
  work_order_number: string;
  description: string;
  status: string;
  service_type: string;
  created_at: string;
  customer_id: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

interface FormattedWorkOrder {
  id: string;
  customer: string;
  service: string;
  status: string;
  date: string;
  priority: string;
  timeAgo: string;
}

export function LiveRecentWorkOrders() {
  const [workOrders, setWorkOrders] = useState<FormattedWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentWorkOrders = async () => {
    try {
      setError(null);
      console.log("Fetching recent work orders...");
      
      // Fetch work orders
      const { data: workOrdersData, error: workOrdersError } = await supabase
        .from('work_orders')
        .select('id, work_order_number, description, status, service_type, created_at, customer_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (workOrdersError) {
        console.error("Work orders error:", workOrdersError);
        throw workOrdersError;
      }

      console.log("Work orders fetched:", workOrdersData);

      if (!workOrdersData || workOrdersData.length === 0) {
        console.log("No work orders found");
        setWorkOrders([]);
        return;
      }

      // Get unique customer IDs
      const customerIds = [...new Set(workOrdersData.map(wo => wo.customer_id).filter(Boolean))];
      
      // Fetch customers separately
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .in('id', customerIds);

      if (customersError) {
        console.error("Customers error:", customersError);
      }

      console.log("Customers fetched:", customersData);

      // Create customer lookup map
      const customerMap = new Map<string, Customer>();
      if (customersData) {
        customersData.forEach(customer => {
          customerMap.set(customer.id, customer);
        });
      }

      // Format work orders
      const formattedOrders: FormattedWorkOrder[] = workOrdersData.map(order => {
        const customer = customerMap.get(order.customer_id);
        const customerName = customer 
          ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() 
          : 'Unknown Customer';

        return {
          id: order.id,
          customer: customerName,
          service: order.service_type || order.description || 'Service',
          status: order.status,
          date: new Date(order.created_at).toLocaleDateString(),
          timeAgo: formatDistanceToNow(new Date(order.created_at), { addSuffix: true }),
          priority: 'medium' // Default priority
        };
      });

      console.log("Formatted work orders:", formattedOrders);
      setWorkOrders(formattedOrders);

    } catch (err: any) {
      console.error("Error fetching work orders:", err);
      setError(err.message || 'Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentWorkOrders();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchRecentWorkOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'secondary' as const, icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'in-progress': { variant: 'default' as const, icon: Loader2, color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'in_progress': { variant: 'default' as const, icon: Loader2, color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'completed': { variant: 'success' as const, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      'cancelled': { variant: 'destructive' as const, icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 font-medium`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').replace('-', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-6 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to load work orders</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={fetchRecentWorkOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (workOrders.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No work orders yet</h3>
          <p className="text-slate-600">Work orders will appear here once they're created.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {workOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100/50 rounded-lg transition-all duration-200 border border-slate-100">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {order.customer.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {order.customer}
                  </p>
                  <span className="text-slate-400">•</span>
                  <p className="text-sm text-slate-600 truncate">
                    {order.service}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {order.timeAgo}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
