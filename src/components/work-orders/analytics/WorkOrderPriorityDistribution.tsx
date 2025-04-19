
import React, { useMemo } from "react";
import { WorkOrder } from "@/types/workOrder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { priorityMap } from "@/utils/workOrders";

interface WorkOrderPriorityDistributionProps {
  workOrders: WorkOrder[];
}

export function WorkOrderPriorityDistribution({ workOrders }: WorkOrderPriorityDistributionProps) {
  // Prepare pie chart data for priority distribution
  const priorityData = useMemo(() => {
    const priorities: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0
    };

    // Count work orders by priority
    workOrders.forEach((wo) => {
      if (wo.priority && priorities.hasOwnProperty(wo.priority)) {
        priorities[wo.priority]++;
      }
    });

    // Convert to array format for chart
    return Object.entries(priorities).map(([key, value]) => ({
      name: priorityMap[key]?.label || key,
      value,
      color: key === 'low' ? '#10B981' : key === 'medium' ? '#F59E0B' : '#EF4444',
    }));
  }, [workOrders]);

  // Calculate average completion time by priority
  const completionTimeByPriority = useMemo(() => {
    const data: Record<string, { totalHours: number; count: number; }> = {
      low: { totalHours: 0, count: 0 },
      medium: { totalHours: 0, count: 0 },
      high: { totalHours: 0, count: 0 }
    };

    // Sum up completion times by priority
    workOrders.forEach((wo) => {
      if (wo.priority && 
          wo.status === 'completed' && 
          data.hasOwnProperty(wo.priority) && 
          wo.startTime && 
          wo.endTime) {
        
        try {
          const startTime = new Date(wo.startTime);
          const endTime = new Date(wo.endTime);
          const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          if (!isNaN(hours) && hours >= 0) {
            data[wo.priority].totalHours += hours;
            data[wo.priority].count++;
          }
        } catch (e) {
          console.error("Error calculating completion time:", e);
        }
      }
    });

    // Convert to array format with averages
    return Object.entries(data).map(([key, { totalHours, count }]) => ({
      name: priorityMap[key]?.label || key,
      hours: count > 0 ? totalHours / count : 0,
      count,
      color: key === 'low' ? '#10B981' : key === 'medium' ? '#F59E0B' : '#EF4444',
    }));
  }, [workOrders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Distribution</CardTitle>
        <CardDescription>
          Work orders by priority level and completion time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 order-2 md:order-1">
            <h4 className="font-medium mb-3">Average Completion Time by Priority</h4>
            <div className="space-y-4">
              {completionTimeByPriority.map((item) => (
                <div key={item.name} className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-lg font-bold">
                      {item.hours.toFixed(1)} hrs
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {item.count} completed work orders
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-span-1 order-1 md:order-2">
            <h4 className="font-medium mb-3 text-center">Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} work orders`, '']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
