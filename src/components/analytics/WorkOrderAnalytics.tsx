import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface WorkOrderMetric {
  label: string;
  value: number;
  change: number;
  format: 'number' | 'currency' | 'percentage' | 'hours';
}

interface EfficiencyMetric {
  technician: string;
  completedOrders: number;
  avgCompletionTime: number;
  efficiency: number;
  revenue: number;
}

interface WorkOrderAnalyticsProps {
  metrics: WorkOrderMetric[];
  efficiency: EfficiencyMetric[];
  statusDistribution: { status: string; count: number; percentage: number; color: string }[];
  isLoading?: boolean;
}

export function WorkOrderAnalytics({ 
  metrics, 
  efficiency, 
  statusDistribution, 
  isLoading = false 
}: WorkOrderAnalyticsProps) {
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      case 'hours':
        return `${value}h`;
      default:
        return value.toLocaleString();
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-emerald-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatValue(metric.value, metric.format)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(metric.change)}
                  <span className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-emerald-600' : 
                    metric.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {metric.change !== 0 && (metric.change > 0 ? '+' : '')}{metric.change}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Work Order Status
            </CardTitle>
            <CardDescription>Distribution of current work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm font-medium capitalize">
                      {status.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={status.percentage} 
                      className="w-20 h-2"
                    />
                    <span className="text-sm text-muted-foreground">
                      {status.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technician Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Technician Performance
            </CardTitle>
            <CardDescription>Efficiency and productivity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {efficiency.slice(0, 5).map((tech) => (
                <div key={tech.technician} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{tech.technician}</span>
                      <Badge variant={tech.efficiency >= 90 ? 'default' : tech.efficiency >= 70 ? 'secondary' : 'destructive'}>
                        {tech.efficiency}% efficient
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{tech.completedOrders} orders</span>
                      <span>{tech.avgCompletionTime}h avg</span>
                      <span className="font-medium">${tech.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${getEfficiencyColor(tech.efficiency)}`}>
                    {tech.efficiency >= 90 ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : tech.efficiency >= 70 ? (
                      <Clock className="h-6 w-6" />
                    ) : (
                      <AlertCircle className="h-6 w-6" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
          <CardDescription>AI-powered recommendations for optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <h4 className="font-medium text-emerald-800 mb-2">Opportunity</h4>
              <p className="text-sm text-emerald-700">
                Reduce average completion time by 15% through better parts inventory management
              </p>
            </div>
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">Optimization</h4>
              <p className="text-sm text-blue-700">
                Cross-train technicians on high-demand services to improve capacity utilization
              </p>
            </div>
            <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
              <h4 className="font-medium text-orange-800 mb-2">Alert</h4>
              <p className="text-sm text-orange-700">
                Schedule preventive maintenance for equipment showing efficiency decline
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}