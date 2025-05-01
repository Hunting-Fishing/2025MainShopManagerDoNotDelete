
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Sample data for charts
const clicksData = [
  { name: 'Hand Tools', clicks: 325, conversions: 42 },
  { name: 'Power Tools', clicks: 456, conversions: 53 },
  { name: 'Diagnostic', clicks: 290, conversions: 38 },
  { name: 'Clips & Fasteners', clicks: 145, conversions: 15 },
  { name: 'Specialty', clicks: 210, conversions: 28 },
  { name: 'Shop Equipment', clicks: 389, conversions: 47 },
];

const dailyClicksData = [
  { name: 'May 1', clicks: 35 },
  { name: 'May 2', clicks: 42 },
  { name: 'May 3', clicks: 67 },
  { name: 'May 4', clicks: 53 },
  { name: 'May 5', clicks: 72 },
  { name: 'May 6', clicks: 80 },
  { name: 'May 7', clicks: 65 },
  { name: 'May 8', clicks: 59 },
  { name: 'May 9', clicks: 81 },
  { name: 'May 10', clicks: 95 },
  { name: 'May 11', clicks: 87 },
  { name: 'May 12', clicks: 105 },
  { name: 'May 13', clicks: 115 },
  { name: 'May 14', clicks: 122 },
];

const tierData = [
  { name: 'Premium', value: 45 },
  { name: 'Mid-Grade', value: 35 },
  { name: 'Economy', value: 20 },
];

const TIER_COLORS = ['#4CAF50', '#2196F3', '#FFC107'];

export default function AnalyticsTab() {
  // Calculate total clicks and conversions
  const totalClicks = clicksData.reduce((sum, item) => sum + item.clicks, 0);
  const totalConversions = clicksData.reduce((sum, item) => sum + item.conversions, 0);
  const conversionRate = ((totalConversions / totalClicks) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Affiliate Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{totalClicks.toLocaleString()}</CardTitle>
              <CardDescription>Total Clicks</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{totalConversions.toLocaleString()}</CardTitle>
              <CardDescription>Total Conversions</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{conversionRate}%</CardTitle>
              <CardDescription>Conversion Rate</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Clicks & Conversions by Category</CardTitle>
            <CardDescription>Performance metrics for each tool category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clicksData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="conversions" name="Conversions" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Daily Click Trend</CardTitle>
            <CardDescription>Click performance over the past 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyClicksData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    name="Clicks" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Clicks by Product Tier</CardTitle>
          <CardDescription>Distribution of clicks by product quality tier</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-[300px] w-full max-w-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
