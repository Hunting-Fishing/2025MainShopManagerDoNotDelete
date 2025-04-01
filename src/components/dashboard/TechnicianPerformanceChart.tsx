
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getTechnicianPerformance } from "@/services/workOrderService";

export const TechnicianPerformanceChart = () => {
  const [data, setData] = useState([]);
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define line colors
  const lineColors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];

  useEffect(() => {
    const fetchTechnicianPerformance = async () => {
      try {
        setLoading(true);
        const result = await getTechnicianPerformance();
        setData(result.chartData);
        setTechnicians(result.technicians);
        setError(null);
      } catch (err) {
        console.error("Error fetching technician performance:", err);
        setError("Failed to load technician performance data");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianPerformance();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Technician Performance (Orders Completed)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-esm-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Technician Performance (Orders Completed)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center flex-col">
            <p className="text-red-500">{error}</p>
            <p className="text-sm text-slate-500 mt-2">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (technicians.length === 0 || data.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Technician Performance (Orders Completed)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No technician performance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              {technicians.map((tech, index) => {
                const techKey = tech.toLowerCase().replace(/\s+/g, '_');
                return (
                  <Line 
                    key={tech}
                    type="monotone" 
                    dataKey={techKey} 
                    name={tech} 
                    stroke={lineColors[index % lineColors.length]} 
                    activeDot={{ r: 8 }} 
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
