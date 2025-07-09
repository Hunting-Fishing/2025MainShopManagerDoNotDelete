import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';

interface AnalyticsData {
  totalRevenue: number;
  revenueChange: number;
  avgCompletionTime: number;
  completionTimeChange: number;
  customerSatisfaction: number;
  satisfactionChange: number;
  productivityScore: number;
  productivityChange: number;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  technicianPerformance: Array<{ 
    name: string; 
    completedJobs: number; 
    avgTime: number; 
    efficiency: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{ month: string; revenue: number; completed: number }>;
  upcomingDeadlines: Array<{ 
    workOrderId: string; 
    customer: string; 
    dueDate: string; 
    priority: string;
  }>;
}

export function WorkOrderAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  // Real-time updates for work orders
  useRealtime('work_orders', {
    invalidateQueries: ['work-order-analytics'],
    onUpdate: () => {
      // Refresh analytics data when work orders change
      fetchAnalytics();
    }
  });

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        totalRevenue: 45230,
        revenueChange: 12.5,
        avgCompletionTime: 3.2,
        completionTimeChange: -8.3,
        customerSatisfaction: 4.6,
        satisfactionChange: 5.2,
        productivityScore: 87,
        productivityChange: 3.1,
        statusDistribution: [
          { status: 'completed', count: 156, percentage: 52 },
          { status: 'in_progress', count: 45, percentage: 15 },
          { status: 'scheduled', count: 67, percentage: 22 },
          { status: 'pending', count: 33, percentage: 11 }
        ],
        technicianPerformance: [
          { name: 'John Smith', completedJobs: 23, avgTime: 2.8, efficiency: 92, revenue: 8450 },
          { name: 'Sarah Johnson', completedJobs: 19, avgTime: 3.1, efficiency: 88, revenue: 7200 },
          { name: 'Mike Wilson', completedJobs: 21, avgTime: 3.5, efficiency: 85, revenue: 6890 }
        ],
        monthlyTrends: [
          { month: 'Jan', revenue: 38500, completed: 142 },
          { month: 'Feb', revenue: 41200, completed: 158 },
          { month: 'Mar', revenue: 45230, completed: 167 }
        ],
        upcomingDeadlines: [
          { workOrderId: 'WO-2024-001', customer: 'ABC Motors', dueDate: '2024-01-15', priority: 'high' },
          { workOrderId: 'WO-2024-002', customer: 'XYZ Fleet', dueDate: '2024-01-16', priority: 'medium' }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const getChangeIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="w-4 h-4 text-success" /> : 
      <TrendingDown className="w-4 h-4 text-destructive" />;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header with timeframe selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Work Order Analytics</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(data.revenueChange)}`}>
              {getChangeIcon(data.revenueChange)}
              {Math.abs(data.revenueChange)}% vs last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                <p className="text-2xl font-bold">{data.avgCompletionTime} days</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(data.completionTimeChange)}`}>
              {getChangeIcon(data.completionTimeChange)}
              {Math.abs(data.completionTimeChange)}% vs last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                <p className="text-2xl font-bold">{data.customerSatisfaction}/5.0</p>
              </div>
              <CheckCircle className="w-8 h-8 text-warning" />
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(data.satisfactionChange)}`}>
              {getChangeIcon(data.satisfactionChange)}
              {Math.abs(data.satisfactionChange)}% vs last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Productivity Score</p>
                <p className="text-2xl font-bold">{data.productivityScore}%</p>
              </div>
              <Users className="w-8 h-8 text-info" />
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(data.productivityChange)}`}>
              {getChangeIcon(data.productivityChange)}
              {Math.abs(data.productivityChange)}% vs last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution & Technician Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.statusDistribution.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{item.status.replace('_', ' ')}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.technicianPerformance.map((tech) => (
                <div key={tech.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">{tech.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {tech.completedJobs} jobs • {tech.avgTime} days avg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${tech.revenue.toLocaleString()}</p>
                    <Badge variant={tech.efficiency >= 90 ? "default" : "secondary"}>
                      {tech.efficiency}% efficiency
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.upcomingDeadlines.map((deadline) => (
              <div key={deadline.workOrderId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{deadline.workOrderId}</p>
                  <p className="text-sm text-muted-foreground">{deadline.customer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={deadline.priority === 'high' ? 'destructive' : 'secondary'}
                    className="capitalize"
                  >
                    {deadline.priority}
                  </Badge>
                  <span className="text-sm">{deadline.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}