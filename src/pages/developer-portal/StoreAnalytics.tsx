import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Package
} from 'lucide-react';

export default function StoreAnalytics() {
  const metrics = [
    {
      title: 'Total Products',
      value: '156',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Package
    },
    {
      title: 'Active Affiliates',
      value: '24',
      change: '+3%',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      title: 'Monthly Clicks',
      value: '2,847',
      change: '+18%',
      changeType: 'positive' as const,
      icon: TrendingUp
    },
    {
      title: 'Est. Revenue',
      value: '$1,234',
      change: '+8%',
      changeType: 'positive' as const,
      icon: DollarSign
    }
  ];

  return (
    <>
      <Helmet>
        <title>Store Analytics | Developer Portal</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            Store Analytics
          </h1>
          <p className="text-muted-foreground">
            Module store performance metrics and insights
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Placeholder */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Click-through rates by product category</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chart coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Module Distribution</CardTitle>
              <CardDescription>Products by module</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chart coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Products with the highest engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Product analytics coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
