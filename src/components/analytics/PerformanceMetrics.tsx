import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PerformanceMetricsProps {
  data?: any;
  isLoading?: boolean;
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

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No performance data available. Complete work orders to see metrics.
      </div>
    );
  }

  const metrics = data;

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