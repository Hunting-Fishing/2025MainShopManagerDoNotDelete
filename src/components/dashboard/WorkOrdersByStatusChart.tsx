
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getWorkOrderStatusCounts } from "@/services/dashboardService";

export function WorkOrdersByStatusChart() {
  const [statusCounts, setStatusCounts] = useState<{ name: string; value: number; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        setLoading(true);
        const data = await getWorkOrderStatusCounts();
        setStatusCounts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching work order status counts:", err);
        setError("Failed to load status data");
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444"];
  
  // Find status counts by name
  const pendingCount = statusCounts.find(item => item.name.toLowerCase() === 'pending')?.value || 0;
  const inProgressCount = statusCounts.find(item => item.name.toLowerCase() === 'in-progress')?.value || 0;
  const completedCount = statusCounts.find(item => item.name.toLowerCase() === 'completed')?.value || 0;
  const cancelledCount = statusCounts.find(item => item.name.toLowerCase() === 'cancelled')?.value || 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-esm-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Orders by Status</CardTitle>
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
        <CardTitle>Work Orders by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusCounts}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  name,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#fff"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col items-center p-2 bg-blue-50 rounded">
            <span className="text-sm text-blue-800 font-medium">Pending</span>
            <span className="text-xl font-bold text-blue-800">{pendingCount}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-amber-50 rounded">
            <span className="text-sm text-amber-800 font-medium">In Progress</span>
            <span className="text-xl font-bold text-amber-800">{inProgressCount}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-green-50 rounded">
            <span className="text-sm text-green-800 font-medium">Completed</span>
            <span className="text-xl font-bold text-green-800">{completedCount}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-red-50 rounded">
            <span className="text-sm text-red-800 font-medium">Cancelled</span>
            <span className="text-xl font-bold text-red-800">{cancelledCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
