
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductsByCategoryChartProps {
  data: { name: string; count: number }[];
}

export function ProductsByCategoryChart({ data }: ProductsByCategoryChartProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Products by Category</CardTitle>
        <CardDescription>Distribution of products across categories</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">No category data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 12 }}
                height={70} 
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name="Product Count" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
