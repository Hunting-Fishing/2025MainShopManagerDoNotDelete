
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, parseISO, differenceInDays, differenceInHours, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface WorkOrderCompletionMetricsProps {
  workOrders: WorkOrder[];
}

export function WorkOrderCompletionMetrics({ workOrders }: WorkOrderCompletionMetricsProps) {
  const completedOrders = workOrders.filter(wo => wo.status === 'completed');
  
  // Calculate average completion time
  const completionTimeData = React.useMemo(() => {
    let totalCompletionTime = 0;
    let count = 0;
    
    completedOrders.forEach(order => {
      if (order.start_time && order.end_time) {
        const startTime = new Date(order.start_time).getTime();
        const endTime = new Date(order.end_time).getTime();
        const completionTime = (endTime - startTime) / (1000 * 60 * 60); // in hours
        
        if (!isNaN(completionTime) && completionTime > 0) {
          totalCompletionTime += completionTime;
          count++;
        }
      }
    });
    
    const avgCompletionTime = count > 0 ? totalCompletionTime / count : 0;
    
    // Calculate time from creation to completion
    let totalLeadTime = 0;
    let leadTimeCount = 0;
    
    completedOrders.forEach(order => {
      if (order.created_at && order.end_time) {
        const creationTime = new Date(order.created_at).getTime();
        const completionTime = new Date(order.end_time).getTime();
        const leadTime = (completionTime - creationTime) / (1000 * 60 * 60); // in hours
        
        if (!isNaN(leadTime) && leadTime > 0) {
          totalLeadTime += leadTime;
          leadTimeCount++;
        }
      }
    });
    
    const avgLeadTime = leadTimeCount > 0 ? totalLeadTime / leadTimeCount : 0;
    
    return {
      avgCompletionTime: avgCompletionTime.toFixed(1),
      avgLeadTime: avgLeadTime.toFixed(1),
      completionCount: count,
    };
  }, [completedOrders]);
  
  // Calculate completion trends over time
  const completionTrendData = React.useMemo(() => {
    // Group completed orders by day
    const completionsByDay: Record<string, { count: number, avgTime: number }> = {};
    
    completedOrders.forEach(order => {
      if (!order.end_time) return;
      
      const dateKey = format(new Date(order.end_time), 'yyyy-MM-dd');
      
      if (!completionsByDay[dateKey]) {
        completionsByDay[dateKey] = { count: 0, avgTime: 0 };
      }
      
      completionsByDay[dateKey].count += 1;
      
      if (order.start_time) {
        const startTime = new Date(order.start_time).getTime();
        const endTime = new Date(order.end_time).getTime();
        const completionTime = (endTime - startTime) / (1000 * 60 * 60); // in hours
        
        if (!isNaN(completionTime) && completionTime > 0) {
          const currentTotal = completionsByDay[dateKey].avgTime * (completionsByDay[dateKey].count - 1);
          completionsByDay[dateKey].avgTime = 
            (currentTotal + completionTime) / completionsByDay[dateKey].count;
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(completionsByDay)
      .map(([date, data]) => ({
        date,
        count: data.count,
        avgTime: parseFloat(data.avgTime.toFixed(1))
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [completedOrders]);

  // On-time completion metrics
  const onTimeMetrics = React.useMemo(() => {
    let onTimeCount = 0;
    let lateCount = 0;
    
    completedOrders.forEach(order => {
      if (order.dueDate && order.end_time) {
        const dueDate = new Date(order.dueDate);
        const completionDate = new Date(order.end_time);
        
        if (completionDate <= dueDate) {
          onTimeCount++;
        } else {
          lateCount++;
        }
      }
    });
    
    const total = onTimeCount + lateCount;
    const onTimePercentage = total > 0 ? (onTimeCount / total * 100).toFixed(1) : "0";
    
    return {
      onTimeCount,
      lateCount,
      onTimePercentage,
      total
    };
  }, [completedOrders]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{completionTimeData.avgCompletionTime}h</div>
            <div className="text-sm text-muted-foreground">Average Work Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{completionTimeData.avgLeadTime}h</div>
            <div className="text-sm text-muted-foreground">Average Lead Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{onTimeMetrics.onTimePercentage}%</div>
            <div className="text-sm text-muted-foreground">On-Time Completion</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Trends</CardTitle>
          <CardDescription>Work orders completed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={completionTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(dateStr) => format(parseISO(dateStr), 'MM/dd')}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(dateStr) => format(parseISO(dateStr as string), 'MMM dd, yyyy')}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="count" 
                  name="Completed Orders" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgTime" 
                  name="Avg. Hours" 
                  stroke="#82ca9d" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>On-Time Delivery Performance</CardTitle>
          <CardDescription>Completed work orders vs. due dates</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-48 h-48 relative flex items-center justify-center mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="transparent" 
                stroke="#f3f4f6" 
                strokeWidth="10" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="transparent" 
                stroke="#10B981" 
                strokeWidth="10" 
                strokeDasharray={`${onTimeMetrics.onTimePercentage * 2.83} 283`} 
                strokeDashoffset="-70.75" 
                transform="rotate(-90 50 50)" 
              />
              <text 
                x="50" 
                y="50" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-2xl font-bold"
                fill="#0f172a"
              >
                {onTimeMetrics.onTimePercentage}%
              </text>
            </svg>
          </div>
          
          <div className="grid grid-cols-2 gap-8 w-full max-w-xs">
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-green-600">{onTimeMetrics.onTimeCount}</div>
              <div className="text-sm text-muted-foreground">On Time</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-red-500">{onTimeMetrics.lateCount}</div>
              <div className="text-sm text-muted-foreground">Late</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
