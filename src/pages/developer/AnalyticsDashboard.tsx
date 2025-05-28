
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { Container, Segment, Header as SemanticHeader } from "semantic-ui-react";

export default function AnalyticsDashboard() {
  // Mock analytics data
  const systemStats = [
    { title: "Total Users", value: "2,847", change: "+12%", icon: Users, color: "text-blue-600" },
    { title: "Monthly Revenue", value: "$84,392", change: "+18%", icon: DollarSign, color: "text-green-600" },
    { title: "Work Orders", value: "1,563", change: "+7%", icon: Activity, color: "text-purple-600" },
    { title: "System Uptime", value: "99.9%", change: "+0.1%", icon: TrendingUp, color: "text-amber-600" },
  ];

  const recentActivity = [
    { time: "2 minutes ago", event: "New user registration", type: "user" },
    { time: "5 minutes ago", event: "Work order completed", type: "order" },
    { time: "12 minutes ago", event: "Payment processed", type: "payment" },
    { time: "18 minutes ago", event: "System backup completed", type: "system" },
  ];

  return (
    <Container fluid className="px-4 py-8">
      <Segment raised className="mb-8 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-t-rose-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <Button variant="outline" size="sm" className="mb-4" asChild>
              <Link to="/developer">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
              </Link>
            </Button>
            <SemanticHeader as="h1" className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-rose-600" />
              Analytics Dashboard
            </SemanticHeader>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Comprehensive analytics and reporting for system performance
            </p>
          </div>
        </div>
      </Segment>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger 
            value="overview" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-rose-600 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            User Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemStats.map((stat, index) => (
              <Card key={index} className="border-t-4 border-t-rose-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle>System Activity</CardTitle>
                <CardDescription>Recent system events and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="font-medium">{activity.event}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        activity.type === 'user' ? 'bg-blue-500' :
                        activity.type === 'order' ? 'bg-green-500' :
                        activity.type === 'payment' ? 'bg-yellow-500' : 'bg-purple-500'
                      }`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common analytics tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Monthly Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Export User Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  System Health Check
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  User Engagement Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user behavior and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Analytics</h3>
                <p className="text-gray-600">Detailed user analytics will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance and optimization data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
                <p className="text-gray-600">Performance analytics will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>Generate and manage custom analytics reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Custom Reports</h3>
                <p className="text-gray-600">Custom reporting tools will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
