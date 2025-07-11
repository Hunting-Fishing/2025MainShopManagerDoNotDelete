import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PerformanceMetricsProps {
  data: any;
  isLoading: boolean;
}

export function PerformanceMetrics({ data, isLoading }: PerformanceMetricsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const defaultMetrics = [
    { label: 'Customer Satisfaction', value: 85, target: 90 },
    { label: 'On-Time Completion', value: 78, target: 85 },
    { label: 'First-Time Fix Rate', value: 92, target: 95 },
    { label: 'Equipment Utilization', value: 67, target: 80 },
  ];

  const metrics = data || defaultMetrics;

  return (
    <div className="space-y-6">
      {metrics.map((metric: any, index: number) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{metric.label}</span>
            <span className="text-muted-foreground">
              {metric.value}% / {metric.target}%
            </span>
          </div>
          <Progress 
            value={metric.value} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            Target: {metric.target}%
          </div>
        </div>
      ))}
    </div>
  );
}