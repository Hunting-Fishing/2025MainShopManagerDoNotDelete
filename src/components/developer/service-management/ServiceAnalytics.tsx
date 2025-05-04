
import React from 'react';
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, Cell, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Pie } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface ServiceAnalyticsProps {
  categories: ServiceMainCategory[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({ categories }) => {
  // Prepare data for services by category
  const categoryData = categories.map(cat => {
    const servicesCount = cat.subcategories.reduce(
      (total, sub) => total + sub.jobs.length, 0
    );
    return {
      name: cat.name,
      services: servicesCount,
      subcategories: cat.subcategories.length
    };
  }).sort((a, b) => b.services - a.services);

  // Prepare data for time and price by category
  const timeAndPriceData = categories.map(cat => {
    let totalTime = 0;
    let totalPrice = 0;
    
    cat.subcategories.forEach(sub => {
      sub.jobs.forEach(job => {
        totalTime += job.estimatedTime || 0;
        totalPrice += job.price || 0;
      });
    });
    
    return {
      name: cat.name,
      totalTime,
      totalPrice
    };
  });

  // Prepare data for service distribution
  const subcategoryData: { name: string; category: string; services: number; }[] = [];
  categories.forEach(cat => {
    cat.subcategories.forEach(sub => {
      subcategoryData.push({
        name: sub.name,
        category: cat.name,
        services: sub.jobs.length
      });
    });
  });
  subcategoryData.sort((a, b) => b.services - a.services);

  // Calculate totals
  const totalServices = categories.reduce(
    (total, cat) => total + cat.subcategories.reduce(
      (subTotal, sub) => subTotal + sub.jobs.length, 0
    ), 0
  );
  
  const totalTime = categories.reduce(
    (total, cat) => total + cat.subcategories.reduce(
      (subTotal, sub) => subTotal + sub.jobs.reduce(
        (jobTotal, job) => jobTotal + (job.estimatedTime || 0), 0
      ), 0
    ), 0
  );
  
  const totalPrice = categories.reduce(
    (total, cat) => total + cat.subcategories.reduce(
      (subTotal, sub) => subTotal + sub.jobs.reduce(
        (jobTotal, job) => jobTotal + (job.price || 0), 0
      ), 0
    ), 0
  );

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-blue-600">Total Services</div>
            <div className="text-3xl font-bold text-blue-700">{totalServices}</div>
            <div className="text-xs text-blue-500 mt-1">Across all categories</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-white border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-amber-600">Total Time</div>
            <div className="text-3xl font-bold text-amber-700">{formatTime(totalTime)}</div>
            <div className="text-xs text-amber-500 mt-1">Estimated service time</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-emerald-600">Total Price</div>
            <div className="text-3xl font-bold text-emerald-700">{formatCurrency(totalPrice)}</div>
            <div className="text-xs text-emerald-500 mt-1">Combined service pricing</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Services by Category</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData.slice(0, 10)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      return [`${value}`, name === "services" ? "Services" : "Subcategories"];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="services" name="Services" fill="#8884d8" />
                  <Bar dataKey="subcategories" name="Subcategories" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="services"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} services`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time & Price by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeAndPriceData.sort((a, b) => b.totalPrice - a.totalPrice).slice(0, 10)}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "totalTime") return [formatTime(value as number), "Total Time"];
                    return [formatCurrency(value as number), "Total Price"];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="totalTime" name="Total Time (min)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="totalPrice" name="Total Price ($)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceAnalytics;
