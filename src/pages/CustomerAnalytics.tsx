
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerSegmentChart } from '@/components/analytics/CustomerSegmentChart';
import { CustomerLifetimeValueChart } from '@/components/analytics/CustomerLifetimeValueChart';
import { CustomerRetentionChart } from '@/components/analytics/CustomerRetentionChart';
import { Button } from '@/components/ui/button';
import { DownloadIcon, RefreshCcw } from 'lucide-react';

export default function CustomerAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  
  // Sample data for charts
  const segmentData = [
    { name: 'High Value', value: 120, color: '#4f46e5' },
    { name: 'Regular', value: 350, color: '#06b6d4' },
    { name: 'Occasional', value: 260, color: '#8b5cf6' },
    { name: 'New', value: 180, color: '#f97316' },
    { name: 'At Risk', value: 90, color: '#ef4444' },
  ];

  const lifetimeValueData = [
    { name: '$0-$500', value: 180 },
    { name: '$501-$1000', value: 240 },
    { name: '$1001-$2000', value: 210 },
    { name: '$2001-$5000', value: 140 },
    { name: '$5001-$10000', value: 90 },
    { name: '$10001+', value: 40 },
  ];

  const retentionData = [
    { month: 'Jan', rate: 96 },
    { month: 'Feb', rate: 95 },
    { month: 'Mar', rate: 93 },
    { month: 'Apr', rate: 91 },
    { month: 'May', rate: 88 },
    { month: 'Jun', rate: 90 },
    { month: 'Jul', rate: 92 },
    { month: 'Aug', rate: 94 },
    { month: 'Sep', rate: 95 },
    { month: 'Oct', rate: 96 },
    { month: 'Nov', rate: 97 },
    { month: 'Dec', rate: 98 },
  ];

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Analytics</h1>
          <p className="text-muted-foreground">
            Analyze customer behavior and trends to optimize business decisions.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last 12 months</SelectItem>
              <SelectItem value="2years">Last 2 years</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon">
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
          <TabsTrigger value="retention">Retention Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Total Customers</CardTitle>
                <CardDescription>Active customers in the database</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-14 w-1/2" />
                ) : (
                  <div className="text-4xl font-bold">1,024</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Average LTV</CardTitle>
                <CardDescription>Average customer lifetime value</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-14 w-1/2" />
                ) : (
                  <div className="text-4xl font-bold">$2,850</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Retention Rate</CardTitle>
                <CardDescription>Overall customer retention</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-14 w-1/2" />
                ) : (
                  <div className="text-4xl font-bold">94.2%</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <CustomerSegmentChart data={segmentData} loading={loading} />
            <CustomerLifetimeValueChart data={lifetimeValueData} loading={loading} />
          </div>
        </TabsContent>
        
        <TabsContent value="segments" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Segment Distribution</CardTitle>
                <CardDescription>Customer distribution by segments</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 h-[400px]">
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : (
                  <CustomerSegmentChart data={segmentData} loading={false} className="h-full" />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Segment LTV Analysis</CardTitle>
                <CardDescription>Average lifetime value by segment</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Segment</th>
                        <th className="text-left py-3 px-2">Customers</th>
                        <th className="text-left py-3 px-2">Avg. LTV</th>
                        <th className="text-left py-3 px-2">YoY Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-2">High Value</td>
                        <td className="py-2 px-2">120</td>
                        <td className="py-2 px-2">$8,750</td>
                        <td className="py-2 px-2 text-green-600">+12.4%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-2">Regular</td>
                        <td className="py-2 px-2">350</td>
                        <td className="py-2 px-2">$3,250</td>
                        <td className="py-2 px-2 text-green-600">+5.2%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-2">Occasional</td>
                        <td className="py-2 px-2">260</td>
                        <td className="py-2 px-2">$1,450</td>
                        <td className="py-2 px-2 text-red-600">-1.8%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-2">New</td>
                        <td className="py-2 px-2">180</td>
                        <td className="py-2 px-2">$850</td>
                        <td className="py-2 px-2 text-gray-500">N/A</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">At Risk</td>
                        <td className="py-2 px-2">90</td>
                        <td className="py-2 px-2">$2,950</td>
                        <td className="py-2 px-2 text-red-600">-8.3%</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="retention" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CustomerRetentionChart data={retentionData} loading={loading} />
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Retention Factors</CardTitle>
                <CardDescription>Key factors affecting customer retention</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Service Quality</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Price Satisfaction</span>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Product Quality</span>
                        <span className="text-sm font-medium">91%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Communication</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Problem Resolution</span>
                        <span className="text-sm font-medium">82%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
