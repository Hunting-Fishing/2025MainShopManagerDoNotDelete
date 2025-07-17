import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { ArrowLeft, Filter, Download, Share2, ZoomIn, Target, Users, DollarSign, Clock } from 'lucide-react';

interface DrillDownAnalyticsProps {
  selectedMetric: string | null;
  data: any;
  isLoading: boolean;
  timeRange: string;
}

export function DrillDownAnalytics({ selectedMetric, data, isLoading, timeRange }: DrillDownAnalyticsProps) {
  const [drillDownLevel, setDrillDownLevel] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  if (!selectedMetric) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a Metric to Analyze</h3>
          <p className="text-muted-foreground">
            Click on any chart or metric card to view detailed analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading detailed analytics...</p>
        </CardContent>
      </Card>
    );
  }

  // Mock detailed data - in real implementation, this would come from the API
  const detailedData = {
    revenue: {
      breakdown: [
        { name: 'Service Labor', value: 45000, percentage: 60 },
        { name: 'Parts & Materials', value: 22500, percentage: 30 },
        { name: 'Diagnostic Fees', value: 7500, percentage: 10 }
      ],
      trends: [
        { date: 'Jan 1', value: 1200, customers: 8, orders: 12 },
        { date: 'Jan 2', value: 1800, customers: 12, orders: 18 },
        { date: 'Jan 3', value: 2100, customers: 14, orders: 21 },
        { date: 'Jan 4', value: 1600, customers: 10, orders: 16 },
        { date: 'Jan 5', value: 2400, customers: 16, orders: 24 }
      ],
      topCustomers: [
        { name: 'ABC Logistics', revenue: 5600, orders: 8 },
        { name: 'City Fleet Services', revenue: 4200, orders: 12 },
        { name: 'Downtown Taxi Co.', revenue: 3800, orders: 15 }
      ]
    },
    overview: {
      segments: [
        { name: 'New Customers', value: 35, growth: 12.5 },
        { name: 'Returning Customers', value: 89, growth: 8.2 },
        { name: 'Premium Services', value: 24, growth: 22.1 },
        { name: 'Basic Services', value: 67, growth: 5.4 }
      ]
    }
  };

  const currentData = detailedData[selectedMetric as keyof typeof detailedData] || detailedData.revenue;
  const isRevenueData = selectedMetric === 'revenue';
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const renderRevenueDetails = () => (
    <div className="space-y-6">
      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={isRevenueData ? (currentData as any).breakdown : []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {isRevenueData && (currentData as any).breakdown?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Revenue Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isRevenueData && (currentData as any).topCustomers?.map((customer: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                  </div>
                  <Badge variant="outline">${customer.revenue.toLocaleString()}</Badge>
                </div>
              ))}
              {!isRevenueData && (
                <p className="text-center text-muted-foreground py-8">
                  Customer data not available for this metric
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Revenue vs Customer Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={isRevenueData ? (currentData as any).trends : []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="customers" 
                  name="Customers"
                  tickFormatter={(value) => `${value} customers`}
                />
                <YAxis 
                  dataKey="value" 
                  name="Revenue"
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'value' ? `$${value}` : value,
                    name === 'value' ? 'Revenue' : 'Customers'
                  ]}
                />
                <Scatter 
                  name="Daily Performance" 
                  dataKey="value" 
                  fill="hsl(var(--primary))"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOverviewDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isRevenueData && (currentData as any).segments?.map((segment: any, index: number) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedSegment(segment.name)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {segment.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{segment.value}</div>
              <Badge variant={segment.growth > 10 ? 'default' : 'secondary'}>
                +{segment.growth}% growth
              </Badge>
            </CardContent>
          </Card>
        ))}
        {isRevenueData && (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Segment data not available for revenue analysis. Use the revenue breakdown charts above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedSegment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ZoomIn className="h-5 w-5" />
              Deep Dive: {selectedSegment}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Detailed analysis for {selectedSegment} would appear here with specific insights,
                trends, and actionable recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => selectedMetric ? setDrillDownLevel(0) : undefined}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold capitalize">{selectedMetric} Analysis</h2>
            <p className="text-muted-foreground">Detailed breakdown and insights</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Analytics</span>
        <span>›</span>
        <span className="capitalize">{selectedMetric}</span>
        {selectedSegment && (
          <>
            <span>›</span>
            <span>{selectedSegment}</span>
          </>
        )}
      </div>

      {/* Content based on selected metric */}
      <Tabs defaultValue="detailed" className="w-full">
        <TabsList>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="trends">Trends Analysis</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="detailed" className="space-y-4">
          {selectedMetric === 'revenue' ? renderRevenueDetails() : renderOverviewDetails()}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={isRevenueData ? (currentData as any).trends || [] : []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Correlation analysis between different metrics and external factors would be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-info/10 rounded-lg">
                <h4 className="font-medium text-info-foreground">Revenue Optimization</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Service labor accounts for 60% of revenue. Consider premium service packages to increase margin.
                </p>
              </div>
              <div className="p-4 bg-success/10 rounded-lg">
                <h4 className="font-medium text-success-foreground">Customer Retention</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Top 3 customers generate 40% of revenue. Implement loyalty programs to maintain relationships.
                </p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg">
                <h4 className="font-medium text-warning-foreground">Growth Opportunity</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Strong correlation between customer count and revenue suggests successful customer acquisition drives growth.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}