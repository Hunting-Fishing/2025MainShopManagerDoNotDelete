import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Database, 
  Globe, 
  Server, 
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: { time: string; value: number }[];
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  database: number;
  uptime: number;
}

const mockMetrics: PerformanceMetric[] = [
  {
    name: 'Page Load Time',
    value: 1.2,
    unit: 's',
    status: 'good',
    trend: 'stable',
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 1.2 + Math.random() * 0.3
    }))
  },
  {
    name: 'API Response Time',
    value: 245,
    unit: 'ms',
    status: 'good',
    trend: 'down',
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 200 + Math.random() * 100
    }))
  },
  {
    name: 'Database Query Time',
    value: 45,
    unit: 'ms',
    status: 'warning',
    trend: 'up',
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 30 + Math.random() * 30
    }))
  },
  {
    name: 'Memory Usage',
    value: 78,
    unit: '%',
    status: 'warning',
    trend: 'up',
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 60 + Math.random() * 30
    }))
  },
  {
    name: 'Error Rate',
    value: 0.02,
    unit: '%',
    status: 'good',
    trend: 'stable',
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: Math.random() * 0.1
    }))
  },
  {
    name: 'Active Users',
    value: 127,
    unit: 'users',
    status: 'good',
    trend: 'up',
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 100 + Math.random() * 50
    }))
  }
];

const mockSystemHealth: SystemHealth = {
  cpu: 45,
  memory: 78,
  disk: 62,
  network: 34,
  database: 56,
  uptime: 99.9
};

const optimizationSuggestions = [
  {
    type: 'critical',
    title: 'Database Query Optimization',
    description: 'Several slow queries detected. Consider adding indexes for customer lookup queries.',
    impact: 'High',
    effort: 'Medium'
  },
  {
    type: 'warning',
    title: 'Memory Usage Optimization',
    description: 'Memory usage is consistently above 75%. Consider implementing caching strategies.',
    impact: 'Medium',
    effort: 'Low'
  },
  {
    type: 'info',
    title: 'CDN Implementation',
    description: 'Static assets could benefit from CDN distribution to improve load times.',
    impact: 'Medium',
    effort: 'High'
  }
];

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState(mockMetrics);
  const [systemHealth, setSystemHealth] = useState(mockSystemHealth);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time data updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 0.1,
        history: [
          ...metric.history.slice(1),
          {
            time: new Date().toLocaleTimeString(),
            value: metric.value + (Math.random() - 0.5) * 0.1
          }
        ]
      })));

      setSystemHealth(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 5)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 3)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 10))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <div className="h-3 w-3" />;
    }
  };

  const getHealthColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const exportReport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: metrics.map(m => ({ name: m.name, value: m.value, status: m.status })),
      systemHealth,
      suggestions: optimizationSuggestions
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Real-time system performance and optimization insights
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <Badge className={getStatusColor(metric.status)}>
                      {getStatusIcon(metric.status)}
                      <span className="ml-1 capitalize">{metric.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toFixed(metric.unit === '%' ? 1 : 2)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  </div>
                  <div className="h-20 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metric.history.slice(-12)}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={metric.status === 'good' ? '#10b981' : metric.status === 'warning' ? '#f59e0b' : '#ef4444'}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics[0].history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Health Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{systemHealth.cpu}%</span>
                    <Badge className={systemHealth.cpu > 80 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {systemHealth.cpu > 80 ? 'High' : 'Normal'}
                    </Badge>
                  </div>
                  <Progress value={systemHealth.cpu} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{systemHealth.memory}%</span>
                    <Badge className={systemHealth.memory > 80 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {systemHealth.memory > 80 ? 'High' : 'Normal'}
                    </Badge>
                  </div>
                  <Progress value={systemHealth.memory} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{systemHealth.database}%</span>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <Progress value={systemHealth.database} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{systemHealth.network}%</span>
                    <Badge className="bg-green-100 text-green-800">
                      Normal
                    </Badge>
                  </div>
                  <Progress value={systemHealth.network} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{systemHealth.uptime}%</span>
                    <Badge className="bg-green-100 text-green-800">
                      Excellent
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last 30 days
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimizationSuggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {suggestion.type === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                        {suggestion.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                        {suggestion.type === 'info' && <Activity className="h-4 w-4 text-blue-600" />}
                        <h3 className="font-semibold">{suggestion.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={
                            suggestion.type === 'critical' ? 'border-red-200 text-red-700' :
                            suggestion.type === 'warning' ? 'border-yellow-200 text-yellow-700' :
                            'border-blue-200 text-blue-700'
                          }
                        >
                          {suggestion.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {suggestion.description}
                      </p>
                      <div className="flex gap-4 text-xs">
                        <span><strong>Impact:</strong> {suggestion.impact}</span>
                        <span><strong>Effort:</strong> {suggestion.effort}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Apply Fix
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>High Memory Usage Detected</strong> - Memory usage has been above 75% for the last 2 hours.
                Consider implementing caching strategies or scaling resources.
              </AlertDescription>
            </Alert>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Performance Improved</strong> - API response times have improved by 15% since yesterday.
              </AlertDescription>
            </Alert>

            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                <strong>Scheduled Maintenance</strong> - Database maintenance is scheduled for tonight at 2 AM UTC.
                Expected duration: 30 minutes.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}