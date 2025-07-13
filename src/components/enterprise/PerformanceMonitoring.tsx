import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Activity, Clock, Zap } from 'lucide-react';
import { enterpriseService } from '@/services/enterpriseService';
import type { PerformanceMetric } from '@/types/phase4';

export const PerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await enterpriseService.getPerformanceMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const mockMetrics = [
    { name: 'Response Time', value: 120, unit: 'ms', target: 200, icon: Clock },
    { name: 'Throughput', value: 850, unit: 'req/min', target: 1000, icon: TrendingUp },
    { name: 'CPU Usage', value: 45, unit: '%', target: 80, icon: Activity },
    { name: 'Memory Usage', value: 62, unit: '%', target: 85, icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map((metric) => {
          const Icon = metric.icon;
          const percentage = (metric.value / metric.target) * 100;
          const isHealthy = percentage <= 100;
          
          return (
            <Card key={metric.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: {metric.target}{metric.unit}</span>
                    <span className={isHealthy ? 'text-green-600' : 'text-red-600'}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={`h-2 ${!isHealthy ? '[&>div]:bg-red-500' : ''}`}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            System performance metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Performance Charts</h3>
            <p>Performance visualization charts would be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};