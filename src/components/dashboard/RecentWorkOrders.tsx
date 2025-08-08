
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentWorkOrders } from "@/services/dashboard/workOrderService";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, ClipboardList, Plus } from "lucide-react";
import { RecentWorkOrder } from "@/types/dashboard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function RecentWorkOrders() {
  const [workOrders, setWorkOrders] = useState<RecentWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        console.log("Fetching recent work orders for dashboard...");
        const data = await getRecentWorkOrders();
        console.log("Received work orders data:", data);
        setWorkOrders(data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching recent work orders:", err);
        setError("Failed to load recent work orders");
        setWorkOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  const handleWorkOrderClick = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'in-progress': 
      case 'in_progress': return 'bg-amber-100 text-amber-800';
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
    <Card data-tour="dashboard-recent-work-orders">
      <CardHeader>
        <CardTitle>Recent Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workOrders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Work Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first work order to track service jobs.
              </p>
              <Button onClick={() => navigate('/work-orders/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Work Order
              </Button>
            </div>
          ) : (
            workOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between border-b py-3 last:border-0 cursor-pointer hover:bg-slate-50 rounded-lg px-3 transition-colors group"
                onClick={() => handleWorkOrderClick(order.id)}
              >
                <div className="flex flex-col">
                  <span className="font-medium group-hover:text-blue-600 transition-colors">
                    {order.customer}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {order.service}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(order.priority)}>
                    {order.priority}
                  </Badge>
                  <span className="text-sm">{order.date}</span>
                  <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
