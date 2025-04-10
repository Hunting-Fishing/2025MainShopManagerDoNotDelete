
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getServiceTypeDistribution } from "@/services/dashboardService";

export const ServiceTypeDistributionChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceTypeDistribution = async () => {
      try {
        setLoading(true);
        const serviceData = await getServiceTypeDistribution();
        setData(serviceData);
        setError(null);
      } catch (err) {
        console.error("Error fetching service type distribution:", err);
        setError("Failed to load service type data");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceTypeDistribution();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Service Type Distribution</CardTitle>
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
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Service Type Distribution</CardTitle>
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

  if (data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Service Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No service type data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Service Type Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Service Count" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
