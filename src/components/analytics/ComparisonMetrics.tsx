import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart, ArrowUpDown } from 'lucide-react';

interface ComparisonMetricsProps {
  data: any;
  isLoading: boolean;
  timeRange: string;
}

export function ComparisonMetrics({ data, isLoading, timeRange }: ComparisonMetricsProps) {
  const [comparisonType, setComparisonType] = useState<'period' | 'yoy' | 'mom'>('period');
  const [metric, setMetric] = useState('revenue');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Mock comparison data - in real implementation, this would come from the hook
  const comparisonData = [
    {
      period: 'Week 1',
      current: 12500,
      previous: 10800,
      growth: 15.7
    },
    {
      period: 'Week 2', 
      current: 14200,
      previous: 11200,
      growth: 26.8
    },
    {
      period: 'Week 3',
      current: 13800,
      previous: 12100,
      growth: 14.0
    },
    {
      period: 'Week 4',
      current: 15600,
      previous: 13400,
      growth: 16.4
    }
  ];

  const kpiComparisons = [
    {
      name: 'Revenue',
      current: 56100,
      previous: 47500,
      change: 18.1,
      trend: 'up'
    },
    {
      name: 'Work Orders',
      current: 142,
      previous: 128,
      change: 10.9,
      trend: 'up'
    },
    {
      name: 'Avg Order Value',
      current: 395,
      previous: 371,
      change: 6.5,
      trend: 'up'
    },
    {
      name: 'Customer Satisfaction',
      current: 4.7,
      previous: 4.5,
      change: 4.4,
      trend: 'up'
    }
  ];

  const getComparisonTitle = () => {
    switch (comparisonType) {
      case 'yoy': return 'Year over Year';
      case 'mom': return 'Month over Month';
      default: return 'Period Comparison';
    }
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'currency') return `$${value.toLocaleString()}`;
    if (type === 'percentage') return `${value}%`;
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Comparison Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Period Comparison Analysis</h2>
          <p className="text-muted-foreground">Compare performance across different time periods</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={comparisonType} onValueChange={(value: any) => setComparisonType(value)}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="period">Period vs Period</SelectItem>
              <SelectItem value="yoy">Year over Year</SelectItem>
              <SelectItem value="mom">Month over Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[140px]">
              <BarChart className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="orders">Work Orders</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
              <SelectItem value="satisfaction">Satisfaction</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiComparisons.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.name}
              </CardTitle>
              {kpi.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-error" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(kpi.current, kpi.name === 'Revenue' ? 'currency' : 'number')}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={kpi.trend === 'up' ? 'default' : 'destructive'}>
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                </Badge>
                <span className="text-xs text-muted-foreground">vs previous</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Previous: {formatValue(kpi.previous, kpi.name === 'Revenue' ? 'currency' : 'number')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            {getComparisonTitle()} - {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="period" 
                  className="text-xs fill-muted-foreground"
                />
                <YAxis 
                  yAxisId="left"
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'growth') return [`${value}%`, 'Growth'];
                    return [`$${value.toLocaleString()}`, name === 'current' ? 'Current Period' : 'Previous Period'];
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="previous" 
                  name="Previous Period"
                  fill="hsl(var(--muted))"
                />
                <Bar 
                  yAxisId="left"
                  dataKey="current" 
                  name="Current Period"
                  fill="hsl(var(--primary))"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="growth" 
                  name="Growth %"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Growth Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Growth Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Best performing period</span>
              <Badge variant="default">Week 2 (+26.8%)</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average growth rate</span>
              <Badge variant="outline">+18.2%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Consistency score</span>
              <Badge variant="secondary">85/100</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <p className="text-sm font-medium text-success-foreground">Strong Growth Trend</p>
              <p className="text-xs text-muted-foreground">Maintain current strategies for continued growth</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <p className="text-sm font-medium text-warning-foreground">Monitor Week 3 Dip</p>
              <p className="text-xs text-muted-foreground">Investigate factors that caused slower growth</p>
            </div>
            <div className="p-3 bg-info/10 rounded-lg">
              <p className="text-sm font-medium text-info-foreground">Optimize Peak Periods</p>
              <p className="text-xs text-muted-foreground">Replicate Week 2 success factors</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}