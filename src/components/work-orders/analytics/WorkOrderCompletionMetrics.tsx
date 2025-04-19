
import React, { useMemo } from "react";
import { WorkOrder } from "@/types/workOrder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { differenceInHours, differenceInDays, format, parseISO } from "date-fns";

interface WorkOrderCompletionMetricsProps {
  workOrders: WorkOrder[];
}

export function WorkOrderCompletionMetrics({ workOrders }: WorkOrderCompletionMetricsProps) {
  // Calculate metrics for completed work orders
  const completionData = useMemo(() => {
    const completed = workOrders.filter(wo => wo.status === 'completed' && wo.startTime && wo.endTime);
    
    if (completed.length === 0) {
      return { avgCompletionTime: 0, workOrders: [] };
    }
    
    // Calculate average time to completion
    const totalHours = completed.reduce((total, wo) => {
      const startDate = wo.startTime ? new Date(wo.startTime) : null;
      const endDate = wo.endTime ? new Date(wo.endTime) : null;
      
      if (!startDate || !endDate) return total;
      return total + differenceInHours(endDate, startDate);
    }, 0);
    
    const avgCompletionTime = totalHours / completed.length;
    
    return {
      avgCompletionTime,
      workOrders: completed
    };
  }, [workOrders]);

  // Calculate metrics for turnaround time (from creation to completion)
  const turnaroundData = useMemo(() => {
    const completed = workOrders.filter(wo => wo.status === 'completed' && wo.createdAt && wo.endTime);
    
    if (completed.length === 0) {
      return { avgTurnaroundTime: 0, workOrders: [] };
    }
    
    // Calculate average time to completion
    const totalHours = completed.reduce((total, wo) => {
      const creationDate = wo.createdAt ? new Date(wo.createdAt) : null;
      const completionDate = wo.endTime ? new Date(wo.endTime) : null;
      
      if (!creationDate || !completionDate) return total;
      return total + differenceInHours(completionDate, creationDate);
    }, 0);
    
    const avgTurnaroundTime = totalHours / completed.length;
    
    return {
      avgTurnaroundTime,
      workOrders: completed
    };
  }, [workOrders]);

  // Calculate on-time completion rate
  const onTimeCompletionData = useMemo(() => {
    const completed = workOrders.filter(wo => 
      wo.status === 'completed' && 
      wo.endTime && 
      wo.dueDate
    );
    
    if (completed.length === 0) {
      return { onTimeRate: 0, totalCompleted: 0, onTimeCount: 0 };
    }
    
    // Count on-time completions
    const onTimeCount = completed.filter(wo => {
      const endDate = wo.endTime ? new Date(wo.endTime) : null;
      const dueDate = wo.dueDate ? new Date(wo.dueDate) : null;
      
      if (!endDate || !dueDate) return false;
      return endDate <= dueDate;
    }).length;
    
    const onTimeRate = (onTimeCount / completed.length) * 100;
    
    return {
      onTimeRate,
      totalCompleted: completed.length,
      onTimeCount
    };
  }, [workOrders]);

  // Calculate metrics for in-progress work orders
  const inProgressData = useMemo(() => {
    const inProgress = workOrders.filter(wo => 
      wo.status === 'in-progress' && 
      wo.startTime
    );
    
    if (inProgress.length === 0) {
      return { avgAge: 0, workOrders: [] };
    }
    
    // Calculate average age of in-progress work orders
    const totalDays = inProgress.reduce((total, wo) => {
      const startDate = wo.startTime ? new Date(wo.startTime) : null;
      const today = new Date();
      
      if (!startDate) return total;
      return total + differenceInDays(today, startDate);
    }, 0);
    
    const avgAge = totalDays / inProgress.length;
    
    return {
      avgAge,
      workOrders: inProgress
    };
  }, [workOrders]);

  // Prepare data for monthly completion chart
  const monthlyCompletionData = useMemo(() => {
    const lastSixMonths = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1); // First day of month
      return date;
    }).reverse();
    
    return lastSixMonths.map(month => {
      const monthStart = new Date(month);
      const monthEnd = new Date(month);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      // Filter work orders completed in this month
      const completionsInMonth = workOrders.filter(wo => {
        if (wo.status !== 'completed' || !wo.endTime) return false;
        
        const endDate = new Date(wo.endTime);
        return endDate >= monthStart && endDate < monthEnd;
      }).length;
      
      return {
        month: format(month, 'MMM yyyy'),
        completions: completionsInMonth,
      };
    });
  }, [workOrders]);
  
  // Generate colors for the bars based on values
  const getBarColor = (value: number) => {
    const max = Math.max(...monthlyCompletionData.map(item => item.completions));
    if (max === 0) return '#10B981'; // Default green if no completions
    
    const normalizedValue = value / max;
    if (normalizedValue > 0.7) return '#10B981'; // Green for high values
    if (normalizedValue > 0.3) return '#3B82F6'; // Blue for medium values
    return '#FBBF24'; // Yellow for low values
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Order Completion Metrics</CardTitle>
        <CardDescription>
          Analysis of work order completion rates and times
        </CardDescription>
      </CardHeader>
      <CardContent>
        {workOrders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No work order data available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Monthly completion chart */}
            <div>
              <h4 className="font-medium mb-4">Completions by Month</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyCompletionData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} completions`, 'Completions']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar dataKey="completions" radius={[4, 4, 0, 0]}>
                      {monthlyCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.completions)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-muted-foreground mb-1">Avg. Completion Time</h5>
                <p className="text-2xl font-bold">
                  {completionData.avgCompletionTime.toFixed(1)} hrs
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {completionData.workOrders.length} completed orders
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-muted-foreground mb-1">Avg. Turnaround Time</h5>
                <p className="text-2xl font-bold">
                  {turnaroundData.avgTurnaroundTime.toFixed(1)} hrs
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  From creation to completion
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-muted-foreground mb-1">On-Time Completion</h5>
                <p className="text-2xl font-bold">
                  {onTimeCompletionData.onTimeRate.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {onTimeCompletionData.onTimeCount} of {onTimeCompletionData.totalCompleted} on time
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-muted-foreground mb-1">Avg. Age (In Progress)</h5>
                <p className="text-2xl font-bold">
                  {inProgressData.avgAge.toFixed(1)} days
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {inProgressData.workOrders.length} orders in progress
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
