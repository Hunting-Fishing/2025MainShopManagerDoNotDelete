
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrder } from "@/types/workOrder";
import { statusConfig } from "@/utils/workOrders/statusManagement";

interface WorkOrderStatusChartProps {
  workOrders: WorkOrder[];
}

export function WorkOrderStatusChart({ workOrders }: WorkOrderStatusChartProps) {
  // Count work orders by status
  const statusCounts = workOrders.reduce((acc: Record<string, number>, order) => {
    const status = order.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Convert counts to data array
  const data = Object.keys(statusCounts).map(status => ({
    name: statusConfig[status as keyof typeof statusConfig]?.label || status,
    value: statusCounts[status],
    color: getColorForStatus(status)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Order Status Distribution</CardTitle>
        <CardDescription>Breakdown of work orders by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} work orders`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getColorForStatus(status: string): string {
  switch (status) {
    case "pending":
      return "#FBBF24"; // Amber
    case "in-progress":
      return "#3B82F6"; // Blue
    case "completed":
      return "#10B981"; // Green
    case "cancelled":
      return "#EF4444"; // Red
    default:
      return "#94A3B8"; // Slate
  }
}
