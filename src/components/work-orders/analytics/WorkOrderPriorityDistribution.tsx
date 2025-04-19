
import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { WorkOrder } from "@/types/workOrder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { priorityConfig } from "@/utils/workOrders/statusManagement";

interface WorkOrderPriorityDistributionProps {
  workOrders: WorkOrder[];
}

export function WorkOrderPriorityDistribution({ workOrders }: WorkOrderPriorityDistributionProps) {
  // Calculate work orders by priority
  const priorityData = React.useMemo(() => {
    const data = workOrders.reduce(
      (acc: Record<string, Record<string, number>>, order) => {
        const status = order.status;
        const priority = order.priority || "medium";

        if (!acc[priority]) {
          acc[priority] = { pending: 0, "in-progress": 0, completed: 0, cancelled: 0 };
        }
        
        acc[priority][status] = (acc[priority][status] || 0) + 1;
        
        return acc;
      },
      {}
    );

    return Object.keys(data).map((priority) => {
      return {
        name: priorityConfig[priority as keyof typeof priorityConfig]?.label || priority,
        priority,
        ...data[priority]
      };
    });
  }, [workOrders]);

  // Calculate time to completion by priority
  const timeToCompletionData = React.useMemo(() => {
    const completedOrders = workOrders.filter(
      wo => wo.status === 'completed' && wo.start_time && wo.end_time
    );

    const priorityTimeData: Record<string, { total: number, count: number }> = {
      low: { total: 0, count: 0 },
      medium: { total: 0, count: 0 },
      high: { total: 0, count: 0 }
    };

    completedOrders.forEach(order => {
      const priority = order.priority || 'medium';
      const startTime = new Date(order.start_time!).getTime();
      const endTime = new Date(order.end_time!).getTime();
      const completionTimeHours = (endTime - startTime) / (1000 * 60 * 60);
      
      if (!isNaN(completionTimeHours) && completionTimeHours > 0) {
        priorityTimeData[priority].total += completionTimeHours;
        priorityTimeData[priority].count += 1;
      }
    });

    return Object.keys(priorityTimeData).map(priority => ({
      name: priorityConfig[priority as keyof typeof priorityConfig]?.label || priority,
      "Avg. Time (hours)": priorityTimeData[priority].count > 0 
        ? (priorityTimeData[priority].total / priorityTimeData[priority].count).toFixed(1)
        : "0",
      Count: priorityTimeData[priority].count
    }));
  }, [workOrders]);

  const priorityColors = {
    "low": "#10B981",    // Green
    "medium": "#FBBF24", // Amber
    "high": "#EF4444"    // Red
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Work Order Priority Distribution</CardTitle>
          <CardDescription>Current work orders by priority and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" name="Pending" fill="#FBBF24" />
                <Bar dataKey="in-progress" name="In Progress" fill="#3B82F6" />
                <Bar dataKey="completed" name="Completed" fill="#10B981" />
                <Bar dataKey="cancelled" name="Cancelled" fill="#94A3B8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priority Completion Time</CardTitle>
          <CardDescription>Average time to completion by priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeToCompletionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="Avg. Time (hours)" 
                  fill="#8884d8" 
                />
                <Bar 
                  yAxisId="right"
                  dataKey="Count" 
                  fill="#82ca9d" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
