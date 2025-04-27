
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types/customer";
import { SmsLogsTable } from "@/components/sms/SmsLogsTable";
import { SmsTemplatesList } from "@/components/sms/SmsTemplatesList";
import { CustomerLifetimeValueCard } from "@/components/analytics/CustomerLifetimeValueCard";
import { CustomerSegmentBadges } from "@/components/analytics/CustomerSegmentBadges";
import { ChartContainer } from "@/components/analytics/ChartContainer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface CustomerAnalyticsSectionProps {
  customer: Customer;
}

export const CustomerAnalyticsSection: React.FC<CustomerAnalyticsSectionProps> = ({ 
  customer 
}) => {
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | 'all'>('1y');
  
  // Sample data for customer value over time
  const clvHistoryData = [
    { month: 'Jan', value: 145 },
    { month: 'Feb', value: 210 },
    { month: 'Mar', value: 320 },
    { month: 'Apr', value: 340 },
    { month: 'May', value: 450 },
    { month: 'Jun', value: 480 },
    { month: 'Jul', value: 520 },
    { month: 'Aug', value: 590 },
    { month: 'Sep', value: 620 },
    { month: 'Oct', value: 700 },
    { month: 'Nov', value: 820 },
    { month: 'Dec', value: 900 },
  ];
  
  // Sample service category data
  const serviceCategoryData = [
    { name: 'Repair', value: 65 },
    { name: 'Maintenance', value: 25 },
    { name: 'Upgrade', value: 10 },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sms">SMS Communications</TabsTrigger>
          <TabsTrigger value="templates">SMS Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CustomerLifetimeValueCard customerId={customer.id} className="h-full" />
            
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Customer Segments</CardTitle>
                <CardDescription>
                  Assigned customer segments and categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerSegmentBadges customerId={customer.id} className="mb-6" />
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Retention Risk</h4>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Medium risk (40%)</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <ChartContainer 
            title="Value Over Time" 
            description="Customer value growth over time"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={clvHistoryData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Value']} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          <div className="grid gap-6 md:grid-cols-2">
            <ChartContainer
              title="Service Category Distribution"
              description="Services utilized by category"
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={serviceCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Customer Cohort Comparison</CardTitle>
                <CardDescription>Performance versus similar customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Revenue</span>
                      <span className="text-sm font-medium text-green-600">+18%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '118%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Visit Frequency</span>
                      <span className="text-sm font-medium text-green-600">+5%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '105%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Service Adoption</span>
                      <span className="text-sm font-medium text-amber-600">-8%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Retention</span>
                      <span className="text-sm font-medium text-green-600">+12%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '112%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sms">
          <SmsLogsTable customerId={customer.id} limit={20} />
        </TabsContent>
        
        <TabsContent value="templates">
          <SmsTemplatesList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
