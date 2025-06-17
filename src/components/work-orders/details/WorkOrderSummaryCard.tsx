
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WorkOrderSummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export function WorkOrderSummaryCard({ title, value, subtitle }: WorkOrderSummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
