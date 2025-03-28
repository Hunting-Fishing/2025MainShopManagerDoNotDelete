
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for service type distribution
const data = [
  { subject: "HVAC", value: 120 },
  { subject: "Electrical", value: 98 },
  { subject: "Plumbing", value: 86 },
  { subject: "Security", value: 99 },
  { subject: "Fire Safety", value: 85 },
  { subject: "Other", value: 65 },
];

export const ServiceTypeDistributionChart = () => {
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
