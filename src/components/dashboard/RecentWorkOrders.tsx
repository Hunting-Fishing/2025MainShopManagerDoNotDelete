
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { RecentWorkOrder } from "@/types/dashboard";
import { supabase } from "@/lib/supabase";

export function RecentWorkOrders() {
  const [workOrders, setWorkOrders] = useState<RecentWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        
        // Fetch recent work orders directly with supabase
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            id, 
            description,
            status,
            created_at,
            customer_id
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // If we have work orders, fetch customer details for each
        if (data && data.length > 0) {
          // Get all customer IDs from work orders
          const customerIds = data.map(wo => wo.customer_id).filter(Boolean);
          
          // Fetch customer details if there are IDs
          let customerDetails: Record<string, string> = {};
          if (customerIds.length > 0) {
            const { data: customers, error: customerError } = await supabase
              .from('customers')
              .select('id, first_name, last_name')
              .in('id', customerIds);
              
            if (!customerError && customers) {
              // Create a map of customer IDs to names
              customerDetails = customers.reduce((acc, customer) => {
                acc[customer.id] = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer';
                return acc;
              }, {} as Record<string, string>);
            }
          }
          
          // Map work orders to the format we need
          const mappedWorkOrders = data.map(order => {
            // Determine priority based on status
            let priority = 'normal';
            if (order.status === 'waiting-parts') priority = 'medium';
            if (order.status === 'on-hold') priority = 'high';
            
            return {
              id: order.id,
              customer: order.customer_id ? customerDetails[order.customer_id] || 'Unknown Customer' : 'Unknown Customer',
              service: order.description || 'General Service',
              status: order.status || 'pending',
              date: new Date(order.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }),
              priority
            };
          });
          
          setWorkOrders(mappedWorkOrders);
        } else {
          setWorkOrders([]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching recent work orders:", err);
        setError("Failed to load recent work orders");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64 text-red-500">
            {error}
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
        <div className="space-y-4">
          {workOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent work orders
            </div>
          ) : (
            workOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b py-3 last:border-0">
                <div className="flex flex-col">
                  <span className="font-medium">{order.customer}</span>
                  <span className="text-sm text-muted-foreground">{order.service}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(order.priority)}>
                    {order.priority}
                  </Badge>
                  <span className="text-sm">{order.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
