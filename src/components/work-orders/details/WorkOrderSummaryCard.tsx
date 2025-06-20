
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WorkOrderSummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
}

export function WorkOrderSummaryCard({ title, value, subtitle }: WorkOrderSummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium text-slate-600 mb-1">{title}</div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
        <div className="text-sm text-slate-500">{subtitle}</div>
      </CardContent>
    </Card>
  );
}
