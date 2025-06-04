
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Package } from 'lucide-react';
import { ServiceSelectionSummary as SummaryType } from '@/types/selectedService';
import { formatEstimatedTime, formatPrice } from '@/lib/services/serviceUtils';

interface ServiceSelectionSummaryProps {
  summary: SummaryType;
}

export function ServiceSelectionSummary({ summary }: ServiceSelectionSummaryProps) {
  if (summary.totalServices === 0) return null;

  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Service Summary
            </span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {summary.totalServices} service{summary.totalServices !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          {summary.totalEstimatedTime > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-blue-600" />
              <div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Total Time</div>
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {formatEstimatedTime(summary.totalEstimatedTime)}
                </div>
              </div>
            </div>
          )}
          
          {summary.totalEstimatedCost > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-green-600" />
              <div>
                <div className="text-xs text-green-700 dark:text-green-300">Estimated Cost</div>
                <div className="text-sm font-semibold text-green-900 dark:text-green-100">
                  {formatPrice(summary.totalEstimatedCost)}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
