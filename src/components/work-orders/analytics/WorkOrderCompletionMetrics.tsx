
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { WorkOrder } from "@/types/workOrder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/workOrders/formatters";

interface WorkOrderCompletionMetricsProps {
  workOrders: WorkOrder[];
}

export function WorkOrderCompletionMetrics({ workOrders }: WorkOrderCompletionMetricsProps) {
  // Calculate average completion time overall
  const averageCompletionTime = React.useMemo(() => {
    const completedOrders = workOrders.filter(
      wo => wo.status === 'completed' && wo.startTime && wo.endTime
    );
    
    if (completedOrders.length === 0) return 0;
    
    const totalCompletionTime = completedOrders.reduce((sum, order) => {
      if (!order.startTime || !order.endTime) return sum;
      
      const startTime = new Date(order.startTime).getTime();
      const endTime = new Date(order.endTime).getTime();
      const completionHours = (endTime - startTime) / (1000 * 60 * 60);
      
      return isNaN(completionHours) ? sum : sum + completionHours;
    }, 0);
    
    return totalCompletionTime / completedOrders.length;
  }, [workOrders]);

  // Calculate average turnaround time (from creation to completion)
  const averageTurnaroundTime = React.useMemo(() => {
    const completedOrders = workOrders.filter(
      wo => wo.status === 'completed' && wo.createdAt && wo.endTime
    );
    
    if (completedOrders.length === 0) return 0;
    
    const totalTurnaroundTime = completedOrders.reduce((sum, order) => {
      if (!order.createdAt || !order.endTime) return sum;
      
      const createTime = new Date(order.createdAt).getTime();
      const endTime = new Date(order.endTime).getTime();
      const turnaroundHours = (endTime - createTime) / (1000 * 60 * 60);
      
      return isNaN(turnaroundHours) ? sum : sum + turnaroundHours;
    }, 0);
    
    return totalTurnaroundTime / completedOrders.length;
  }, [workOrders]);

  // Calculate completion rate percentage
  const completionRate = React.useMemo(() => {
    if (workOrders.length === 0) return 0;
    
    const completedCount = workOrders.filter(wo => wo.status === 'completed').length;
    return (completedCount / workOrders.length) * 100;
  }, [workOrders]);

  // Calculate average time-to-completion by month
  const monthlyCompletionTimes = React.useMemo(() => {
    const completedByMonth: Record<string, { total: number, count: number }> = {};
    
    workOrders
      .filter(wo => wo.status === 'completed' && wo.endTime)
      .forEach(order => {
        if (!order.endTime) return;
        
        const endDate = new Date(order.endTime);
        const monthYear = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!completedByMonth[monthYear]) {
          completedByMonth[monthYear] = { total: 0, count: 0 };
        }
        
        if (order.startTime && order.endTime) {
          const startTime = new Date(order.startTime).getTime();
          const endTime = new Date(order.endTime).getTime();
          const completionHours = (endTime - startTime) / (1000 * 60 * 60);
          
          if (!isNaN(completionHours) && completionHours > 0) {
            completedByMonth[monthYear].total += completionHours;
            completedByMonth[monthYear].count += 1;
          }
        }
      });
    
    // Convert to array for chart
    return Object.entries(completedByMonth)
      .map(([month, data]) => ({
        month,
        "Avg Hours": data.count > 0 ? +(data.total / data.count).toFixed(1) : 0,
        "Orders Completed": data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
      
  }, [workOrders]);

  // Calculate overdue rates
  const overdueStats = React.useMemo(() => {
    const total = workOrders.length;
    if (total === 0) return { overduePercentage: 0, overdueCount: 0 };
    
    const now = new Date();
    const overdueCount = workOrders.filter(wo => {
      if (wo.status === 'completed' || wo.status === 'cancelled') return false;
      if (!wo.dueDate) return false;
      
      const dueDate = new Date(wo.dueDate);
      return dueDate < now;
    }).length;
    
    return {
      overduePercentage: (overdueCount / total) * 100,
      overdueCount
    };
  }, [workOrders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Order Completion Metrics</CardTitle>
        <CardDescription>Analysis of completion times and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Avg Completion Time</h4>
            <div className="text-2xl font-semibold">{averageCompletionTime.toFixed(1)} hrs</div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Avg Turnaround Time</h4>
            <div className="text-2xl font-semibold">{averageTurnaroundTime.toFixed(1)} hrs</div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Completion Rate</h4>
            <div className="text-2xl font-semibold">{completionRate.toFixed(1)}%</div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Overdue Rate</h4>
            <div className="text-2xl font-semibold">{overdueStats.overduePercentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">{overdueStats.overdueCount} work orders</div>
          </div>
        </div>
        
        {/* Monthly Completion Times Chart */}
        <div className="h-80 w-full mb-6">
          <h3 className="text-lg font-medium mb-2">Monthly Completion Times</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart
              data={monthlyCompletionTimes}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Avg Hours"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line yAxisId="right" type="monotone" dataKey="Orders Completed" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Status Distribution */}
        <div>
          <h3 className="text-lg font-medium mb-2">Status Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "Pending",
                    count: workOrders.filter(wo => wo.status === 'pending').length,
                    fill: "#FBBF24"
                  },
                  {
                    name: "In Progress",
                    count: workOrders.filter(wo => wo.status === 'in-progress').length,
                    fill: "#3B82F6"
                  },
                  {
                    name: "Completed",
                    count: workOrders.filter(wo => wo.status === 'completed').length,
                    fill: "#10B981"
                  },
                  {
                    name: "Cancelled",
                    count: workOrders.filter(wo => wo.status === 'cancelled').length,
                    fill: "#6B7280"
                  }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
