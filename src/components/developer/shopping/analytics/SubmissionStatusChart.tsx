
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface SubmissionStatusChartProps {
  data: { name: string; value: number }[];
  totalSubmissions: number;
}

// Colors for the chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function SubmissionStatusChart({ data, totalSubmissions }: SubmissionStatusChartProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Submission Status</CardTitle>
        <CardDescription>Current status of user submissions</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {totalSubmissions === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">No submission data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
