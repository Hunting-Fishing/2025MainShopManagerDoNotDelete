
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { WorkOrder } from "@/types/workOrder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkOrderTechniciansPerformanceProps {
  workOrders: WorkOrder[];
}

export function WorkOrderTechniciansPerformance({ workOrders }: WorkOrderTechniciansPerformanceProps) {
  // Group work orders by technician
  const technicianData = useMemo(() => {
    const techStats: Record<string, { 
      completed: number; 
      inProgress: number; 
      pending: number;
      total: number;
      avgCompletionTime?: number;
      totalCompletionTime: number;
      completedCount: number;
    }> = {};

    workOrders.forEach(order => {
      const tech = order.technician || 'Unassigned';

      // Initialize technician record if not exists
      if (!techStats[tech]) {
        techStats[tech] = {
          completed: 0,
          inProgress: 0,
          pending: 0,
          total: 0,
          totalCompletionTime: 0,
          completedCount: 0
        };
      }

      // Count by status
      switch (order.status) {
        case 'completed':
          techStats[tech].completed += 1;
          
          // Calculate completion time if available
          if (order.startTime && order.endTime) {
            try {
              const startTime = new Date(order.startTime);
              const endTime = new Date(order.endTime);
              const completionTime = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // in hours
              
              if (!isNaN(completionTime) && completionTime > 0) {
                techStats[tech].totalCompletionTime += completionTime;
                techStats[tech].completedCount += 1;
              }
            } catch (e) {
              console.error("Error calculating completion time:", e);
            }
          }
          break;
        case 'in-progress':
          techStats[tech].inProgress += 1;
          break;
        case 'pending':
          techStats[tech].pending += 1;
          break;
      }

      // Increment total
      techStats[tech].total += 1;
    });

    // Calculate average completion time
    Object.keys(techStats).forEach(tech => {
      if (techStats[tech].completedCount > 0) {
        techStats[tech].avgCompletionTime = 
          techStats[tech].totalCompletionTime / techStats[tech].completedCount;
      }
    });

    // Convert to array for chart
    return Object.entries(techStats).map(([name, stats]) => ({
      name,
      Completed: stats.completed,
      "In Progress": stats.inProgress,
      Pending: stats.pending,
      "Avg. Hours": stats.avgCompletionTime?.toFixed(1) || '0',
    }));
  }, [workOrders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
        <CardDescription>Work order distribution by technician</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={technicianData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Completed" stackId="a" fill="#10B981" />
              <Bar dataKey="In Progress" stackId="a" fill="#3B82F6" />
              <Bar dataKey="Pending" stackId="a" fill="#FBBF24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-2">Avg. Completion Time (hours)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicianData.map((tech) => (
              <div key={tech.name} className="flex justify-between p-3 bg-slate-50 rounded-md">
                <span>{tech.name}</span>
                <span className="font-semibold">{tech["Avg. Hours"]}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
