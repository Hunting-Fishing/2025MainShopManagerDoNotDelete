
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getWorkOrderStatusCounts } from "@/services/workOrderService";

export const WorkOrdersByStatusChart = () => {
  const [data, setData] = useState([
    { name: "Pending", value: 0, color: "#FDB022" },
    { name: "In Progress", value: 0, color: "#2563EB" },
    { name: "Completed", value: 0, color: "#16A34A" },
    { name: "Cancelled", value: 0, color: "#DC2626" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Try to get actual data from the service
        const statusCounts = await getWorkOrderStatusCounts();
        
        if (statusCounts && Object.keys(statusCounts).length > 0) {
          // Transform the data into the format needed for the chart
          const chartData = [
            { name: "Pending", value: statusCounts.pending || 0, color: "#FDB022" },
            { name: "In Progress", value: statusCounts.inProgress || 0, color: "#2563EB" },
            { name: "Completed", value: statusCounts.completed || 0, color: "#16A34A" },
            { name: "Cancelled", value: statusCounts.cancelled || 0, color: "#DC2626" },
          ];
          setData(chartData);
        }
      } catch (err) {
        console.error("Error fetching work order status data:", err);
        setError("Failed to load chart data");
        // Fallback to default mock data for development
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle loading and error states
  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Work Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Work Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out zero values to avoid empty segments
  const filteredData = data.filter(item => item.value > 0);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Work Orders by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No work order data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
