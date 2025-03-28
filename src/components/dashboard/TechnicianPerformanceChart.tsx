
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for technician performance
const data = [
  { month: "Jan", michael: 14, sarah: 12, david: 15, emily: 10 },
  { month: "Feb", michael: 15, sarah: 18, david: 13, emily: 16 },
  { month: "Mar", michael: 18, sarah: 16, david: 14, emily: 17 },
  { month: "Apr", michael: 16, sarah: 19, david: 12, emily: 15 },
  { month: "May", michael: 19, sarah: 17, david: 16, emily: 18 },
  { month: "Jun", michael: 22, sarah: 20, david: 18, emily: 19 },
];

export const TechnicianPerformanceChart = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Technician Performance (Orders Completed)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="michael" name="Michael Brown" stroke="#3B82F6" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="sarah" name="Sarah Johnson" stroke="#10B981" />
              <Line type="monotone" dataKey="david" name="David Lee" stroke="#F59E0B" />
              <Line type="monotone" dataKey="emily" name="Emily Chen" stroke="#8B5CF6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
