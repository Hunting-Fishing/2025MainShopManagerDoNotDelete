import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WorkOrderSummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function WorkOrderSummaryCard({
  title,
  value,
  subtitle,
  trend = 'neutral',
  trendValue
}: WorkOrderSummaryCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-error" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <Card className="modern-card group hover:scale-[1.02] transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{title}</p>
            <div className="flex items-baseline space-x-3">
              <p className="text-3xl font-bold text-foreground font-heading">{value}</p>
              {trendValue && (
                <div className={`flex items-center space-x-1 ${getTrendColor()} transition-colors duration-200`}>
                  {getTrendIcon()}
                  <span className="text-sm font-semibold">{trendValue}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}