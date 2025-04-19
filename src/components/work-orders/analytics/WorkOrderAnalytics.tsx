
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrderStatusChart } from "./WorkOrderStatusChart";
import { WorkOrderCompletionMetrics } from "./WorkOrderCompletionMetrics";
import { WorkOrderPriorityDistribution } from "./WorkOrderPriorityDistribution";
import { WorkOrderTechniciansPerformance } from "./WorkOrderTechniciansPerformance";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart, BarChart2, Timer } from "lucide-react";

export function WorkOrderAnalytics() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [view, setView] = useState<'status' | 'performance' | 'priority' | 'time'>('status');

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setLoading(true);
      try {
        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            id, status, priority, customer_id, vehicle_id,
            technician_id, created_at, updated_at, start_time,
            end_time, estimated_hours, total_cost, description
          `)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Convert to WorkOrder type
        const fetchedWorkOrders = data as unknown as WorkOrder[];
        setWorkOrders(fetchedWorkOrders);
      } catch (error) {
        console.error("Error fetching work orders:", error);
        toast({
          title: "Error",
          description: "Could not load work order data for analytics",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, [dateRange]);

  const counts = {
    total: workOrders.length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    inProgress: workOrders.filter(wo => wo.status === 'in-progress').length,
    pending: workOrders.filter(wo => wo.status === 'pending').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Work Order Analytics</CardTitle>
            <CardDescription>Performance metrics and insights</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={dateRange === 'week' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setDateRange('week')}
            >
              Week
            </Button>
            <Button 
              variant={dateRange === 'month' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setDateRange('month')}
            >
              Month
            </Button>
            <Button 
              variant={dateRange === 'quarter' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setDateRange('quarter')}
            >
              Quarter
            </Button>
            <Button 
              variant={dateRange === 'year' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setDateRange('year')}
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{counts.total}</div>
              <div className="text-sm text-muted-foreground">Total Work Orders</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-100">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700">{counts.completed}</div>
              <div className="text-sm text-green-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-700">{counts.inProgress}</div>
              <div className="text-sm text-blue-600">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-100">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-700">{counts.pending}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="status" className="w-full" onValueChange={(val) => setView(val as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="status" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Status Distribution</span>
              <span className="sm:hidden">Status</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Technician Performance</span>
              <span className="sm:hidden">Technicians</span>
            </TabsTrigger>
            <TabsTrigger value="priority" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Priority Distribution</span>
              <span className="sm:hidden">Priority</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="hidden sm:inline">Time Metrics</span>
              <span className="sm:hidden">Time</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="status">
            {loading ? (
              <div className="flex justify-center p-8">Loading status data...</div>
            ) : (
              <WorkOrderStatusChart workOrders={workOrders} />
            )}
          </TabsContent>
          <TabsContent value="performance">
            {loading ? (
              <div className="flex justify-center p-8">Loading performance data...</div>
            ) : (
              <WorkOrderTechniciansPerformance workOrders={workOrders} />
            )}
          </TabsContent>
          <TabsContent value="priority">
            {loading ? (
              <div className="flex justify-center p-8">Loading priority data...</div>
            ) : (
              <WorkOrderPriorityDistribution workOrders={workOrders} />
            )}
          </TabsContent>
          <TabsContent value="time">
            {loading ? (
              <div className="flex justify-center p-8">Loading time metrics...</div>
            ) : (
              <WorkOrderCompletionMetrics workOrders={workOrders} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
