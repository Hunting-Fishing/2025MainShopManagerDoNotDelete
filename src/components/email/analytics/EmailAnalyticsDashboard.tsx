
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Calendar, Mail, Users, TrendingUp } from 'lucide-react';

export function EmailAnalyticsDashboard() {
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockAnalytics = {
    totalCampaigns: 12,
    totalSent: 1245,
    openRate: 24.5,
    clickRate: 3.2
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-blue-500 shadow-md bg-white rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Total Campaigns
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {mockAnalytics.totalCampaigns}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-t-4 border-green-500 shadow-md bg-white rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Total Sent
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {mockAnalytics.totalSent.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-t-4 border-purple-500 shadow-md bg-white rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Open Rate
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {mockAnalytics.openRate}%
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-t-4 border-amber-500 shadow-md bg-white rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Click Rate
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {mockAnalytics.clickRate}%
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Performance Overview</CardTitle>
              <CardDescription>
                Track your email marketing performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                Email analytics dashboard coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Detailed analytics for individual campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                Campaign analytics coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>Segment Performance</CardTitle>
              <CardDescription>
                How different customer segments are responding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                Segment analytics coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EmailAnalyticsDashboard;
