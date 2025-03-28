
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for work orders by status
const data = [
  { name: "Pending", value: 18, color: "#FDB022" },
  { name: "In Progress", value: 28, color: "#2563EB" },
  { name: "Completed", value: 45, color: "#16A34A" },
  { name: "Cancelled", value: 9, color: "#DC2626" },
];

export const WorkOrdersByStatusChart = () => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Work Orders by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
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
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
