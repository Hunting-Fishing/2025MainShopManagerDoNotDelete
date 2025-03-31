
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmailCampaignAnalytics, EmailABTestResult } from "@/types/email";
import { Line, LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Bar, BarChart, Legend } from "recharts";
import { 
  BarChart2, 
  Mail, 
  MousePointerClick, 
  Eye, 
  AlertTriangle, 
  ThumbsDown, 
  LineChart as LineChartIcon,
  Users,
  Inbox,
  BarChart as BarChartIcon, 
  Medal
} from "lucide-react";

interface CampaignAnalyticsDashboardProps {
  campaignId: string;
  analytics: EmailCampaignAnalytics | null;
  abTestResult?: EmailABTestResult | null;
  isLoading?: boolean;
}

export function CampaignAnalyticsDashboard({
  campaignId,
  analytics,
  abTestResult,
  isLoading = false
}: CampaignAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [formattedMetrics, setFormattedMetrics] = useState<any[]>([]);
  
  useEffect(() => {
    if (analytics?.timeline) {
      // Process the timeline data for the charts
      const processedData = analytics.timeline.map(point => ({
        date: new Date(point.date).toLocaleDateString(),
        opens: point.opens,
        clicks: point.clicks
      }));
      setTimelineData(processedData);
      
      // Format metrics for the comparison chart
      setFormattedMetrics([
        { name: 'Open Rate', value: analytics.openRate, color: '#3b82f6' },
        { name: 'Click Rate', value: analytics.clickRate, color: '#10b981' },
        { name: 'Click to Open', value: analytics.clickToOpenRate, color: '#6366f1' },
        { name: 'Unsubscribe Rate', value: analytics.unsubscribeRate, color: '#f43f5e' },
        { name: 'Bounce Rate', value: analytics.bouncedRate, color: '#f59e0b' }
      ]);
    }
  }, [analytics]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-60 animate-pulse bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 animate-pulse bg-gray-200 rounded"></div>
          <div className="h-40 animate-pulse bg-gray-200 rounded"></div>
          <div className="h-40 animate-pulse bg-gray-200 rounded"></div>
        </div>
        <div className="h-72 animate-pulse bg-gray-200 rounded mt-6"></div>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Analytics Available</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Analytics data for this campaign hasn't been generated yet. This usually happens after the campaign has been sent.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart2 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Engagement
          </TabsTrigger>
          {abTestResult && (
            <TabsTrigger value="ab-testing">
              <Medal className="h-4 w-4 mr-2" />
              A/B Test Results
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Inbox className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-2xl font-bold">
                      {((analytics.delivered / analytics.sent) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Delivered</div>
                    <div className="font-medium">{analytics.delivered} / {analytics.sent}</div>
                  </div>
                </div>
                <Progress 
                  value={(analytics.delivered / analytics.sent) * 100} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Open Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-green-600" />
                    <span className="text-2xl font-bold">
                      {analytics.openRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Opened</div>
                    <div className="font-medium">{analytics.opened} / {analytics.delivered}</div>
                  </div>
                </div>
                <Progress 
                  value={analytics.openRate} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Click Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <MousePointerClick className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="text-2xl font-bold">
                      {analytics.clickRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Clicked</div>
                    <div className="font-medium">{analytics.clicked} / {analytics.delivered}</div>
                  </div>
                </div>
                <Progress 
                  value={analytics.clickRate} 
                  className="h-2 mt-2" 
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>Open Rate</span>
                    </div>
                    <div className="font-medium">{analytics.openRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <MousePointerClick className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Click Rate</span>
                    </div>
                    <div className="font-medium">{analytics.clickRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <BarChartIcon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span>Click-to-Open Rate</span>
                    </div>
                    <div className="font-medium">{analytics.clickToOpenRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-amber-100 p-2 rounded-full mr-3">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                      <span>Bounce Rate</span>
                    </div>
                    <div className="font-medium">{analytics.bouncedRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-full mr-3">
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                      </div>
                      <span>Unsubscribe Rate</span>
                    </div>
                    <div className="font-medium">{analytics.unsubscribeRate.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-center space-y-1">
                      <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                        <Mail className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold">{analytics.sent}</div>
                      <div className="text-sm text-muted-foreground">Sent</div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-center space-y-1">
                      <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                        <Inbox className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold">{analytics.delivered}</div>
                      <div className="text-sm text-muted-foreground">Delivered</div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-center space-y-1">
                      <div className="bg-amber-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                        <AlertTriangle className="h-8 w-8 text-amber-600" />
                      </div>
                      <div className="text-2xl font-bold">{analytics.bounced}</div>
                      <div className="text-sm text-muted-foreground">Bounced</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Delivery Rate</h4>
                  <Progress 
                    value={(analytics.delivered / analytics.sent) * 100} 
                    className="h-3" 
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">
                      {((analytics.delivered / analytics.sent) * 100).toFixed(1)}% Delivered
                    </span>
                    <span className="text-muted-foreground">
                      {((analytics.bounced / analytics.sent) * 100).toFixed(1)}% Bounced
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Timeline</CardTitle>
              <CardDescription>
                Opens and clicks over time after sending the campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timelineData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="opens"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                      name="Opens"
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#10b981"
                      name="Clicks"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Comparison</CardTitle>
              <CardDescription>
                Comparing key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formattedMetrics}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Rate']} />
                    <Bar
                      dataKey="value"
                      name="Rate"
                      fill="#3b82f6"
                      barSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {abTestResult && (
          <TabsContent value="ab-testing" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>A/B Test Results</CardTitle>
                  {abTestResult.winningVariantId && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Winner Selected
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Performance comparison of different email variants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Variant Performance</h4>
                    <div className="space-y-4">
                      {abTestResult.variants.map((variant) => (
                        <div key={variant.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <h5 className="font-medium">{variant.name}</h5>
                              {abTestResult.winningVariantId === variant.id && (
                                <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-200">
                                  <Medal className="h-3 w-3 mr-1" />
                                  Winner
                                </Badge>
                              )}
                            </div>
                            {variant.improvement !== undefined && variant.improvement > 0 && (
                              <Badge className="bg-green-100 text-green-800">
                                +{variant.improvement.toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                              <div className="text-sm text-muted-foreground">Open Rate</div>
                              <div className="font-medium">{variant.metrics.openRate.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Click Rate</div>
                              <div className="font-medium">{variant.metrics.clickRate.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Click-to-Open</div>
                              <div className="font-medium">{variant.metrics.clickToOpenRate.toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {abTestResult.confidenceLevel && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <BarChart2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-blue-800">Statistical Confidence</h5>
                          <p className="text-sm text-blue-700 mt-1">
                            The winner was determined with {abTestResult.confidenceLevel}% confidence. 
                            {abTestResult.confidenceLevel >= 95 
                              ? ' This is a statistically significant result.'
                              : ' This result is not statistically significant and may be due to chance.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
